/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/carousel.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-11
 * ║ Purpose: AzesCarousel a11y, navigation, empty/single/multi cases
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesCarousel } from './AzesCarousel';
import { carouselScrollBehaviorForDistance, carouselScrollLeftForSlide } from './carouselScroll';
import type { AzesCarouselImage } from './types';

const IMAGES: AzesCarouselImage[] = [
  { src: 'https://example.com/a.jpg', alt: 'A' },
  { src: 'https://example.com/b.jpg', alt: 'B' },
  { src: 'https://example.com/c.jpg', alt: 'C' },
];

beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', IO);
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

function Host(props: ComponentProps<typeof AzesCarousel>) {
  return (
    <AzesThemeProvider>
      <AzesCarousel {...props} />
    </AzesThemeProvider>
  );
}

describe('AzesCarousel', () => {
  it('renders region and slide groups', () => {
    render(<Host images={IMAGES} title="Home" />);
    const region = screen.getByRole('region', { name: 'Home' });
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
    // Inactive slides use aria-hidden; include them for structure assertion.
    const slides = within(region).getAllByRole('group', { hidden: true });
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute('aria-label', '1 / 3');
  });

  it('shows empty placeholder when images is empty', () => {
    render(<Host images={[]} />);
    expect(screen.getByText('No images')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
  });

  it('hides arrows/counter/thumbs for a single image', () => {
    render(<Host images={[IMAGES[0]!]} />);
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
    expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
  });

  it('navigates with next/previous buttons', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Host images={IMAGES} onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(onIndexChange).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole('button', { name: 'Previous image' }));
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it('disables arrows at edges when loop is false', () => {
    render(<Host images={IMAGES} index={0} />);
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled();
    render(
      <AzesThemeProvider>
        <AzesCarousel images={IMAGES} index={2} />
      </AzesThemeProvider>,
    );
    const nextButtons = screen.getAllByRole('button', { name: 'Next image' });
    expect(nextButtons.at(-1)).toBeDisabled();
  });

  it('supports controlled index', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [index, setIndex] = useState(0);
      return (
        <AzesThemeProvider>
          <AzesCarousel images={IMAGES} index={index} onIndexChange={setIndex} />
          <output data-testid="idx">{index}</output>
        </AzesThemeProvider>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByTestId('idx')).toHaveTextContent('1');
  });

  it('navigates via keyboard on the track', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Host images={IMAGES} onIndexChange={onIndexChange} />);
    const track = document.querySelector('[data-azes-carousel-track]') as HTMLElement;
    track.focus();
    await user.keyboard('{ArrowRight}');
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it('navigates via thumbnail buttons', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Host images={IMAGES} onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole('button', { name: '3 / 3' }));
    expect(onIndexChange).toHaveBeenCalledWith(2);
  });

  it('jumps to the first thumbnail with instant scroll from a distant slide', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    Element.prototype.scrollTo = scrollTo;

    function Controlled() {
      const [index, setIndex] = useState(2);
      return (
        <AzesThemeProvider>
          <AzesCarousel images={IMAGES} index={index} onIndexChange={setIndex} />
          <output data-testid="idx">{index}</output>
        </AzesThemeProvider>
      );
    }

    render(<Controlled />);
    const firstThumb = document.querySelector('[data-thumb-index="0"]') as HTMLElement;
    expect(firstThumb).toBeTruthy();
    await user.click(firstThumb);
    expect(screen.getByTestId('idx')).toHaveTextContent('0');

    await vi.waitFor(() => {
      const autoCalls = scrollTo.mock.calls.filter(
        (call) => (call[0] as ScrollToOptions | undefined)?.behavior === 'auto',
      );
      expect(autoCalls.length).toBeGreaterThan(0);
    });
  });

  describe('carouselScroll helpers', () => {
    it('computes scrollLeft from viewport rects (not offsetLeft)', () => {
      const track = {
        scrollLeft: 400,
        getBoundingClientRect: () =>
          ({ left: 100, right: 500, top: 0, bottom: 0, width: 400, height: 0 }) as DOMRect,
      };
      const slide = {
        getBoundingClientRect: () =>
          ({ left: 20, right: 420, top: 0, bottom: 0, width: 400, height: 0 }) as DOMRect,
      };
      expect(carouselScrollLeftForSlide(track, slide)).toBe(320);
    });

    it('uses instant scroll for non-adjacent jumps', () => {
      expect(carouselScrollBehaviorForDistance(0, false)).toBe('smooth');
      expect(carouselScrollBehaviorForDistance(1, false)).toBe('smooth');
      expect(carouselScrollBehaviorForDistance(2, false)).toBe('auto');
      expect(carouselScrollBehaviorForDistance(1, true)).toBe('auto');
    });
  });

  it('opens and closes lightbox', async () => {
    const user = userEvent.setup();
    render(<Host images={IMAGES} showFullscreen />);
    await user.click(screen.getByRole('button', { name: 'View fullscreen' }));
    expect(screen.getByRole('button', { name: 'Close fullscreen' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close fullscreen' }));
    expect(screen.queryByRole('button', { name: 'Close fullscreen' })).not.toBeInTheDocument();
  });

  it('calls onImageClick', async () => {
    const user = userEvent.setup();
    const onImageClick = vi.fn();
    render(<Host images={IMAGES} onImageClick={onImageClick} />);
    const img = document.querySelector('img[alt="A"]') as HTMLImageElement;
    await user.click(img);
    expect(onImageClick).toHaveBeenCalledWith(0);
  });

  it('uses eager loading for the first image when priority is set', () => {
    render(<Host images={IMAGES} priority />);
    const img = document.querySelector('img[alt="A"]') as HTMLImageElement;
    expect(img.getAttribute('loading')).toBe('eager');
  });

  it('loops when loop is enabled', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Host images={IMAGES} index={2} loop onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole('button', { name: 'Next image' }));
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });
});
