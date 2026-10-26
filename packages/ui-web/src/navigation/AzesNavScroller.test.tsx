/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavScroller.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: NavScroller overflow arrows, scrollBy, scrollbar hide
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesNavScroller } from './AzesNavScroller';

type RoCallback = ResizeObserverCallback;

let roCallback: RoCallback | null = null;

function mockScrollerMetrics(
  el: HTMLElement,
  metrics: { clientWidth: number; scrollWidth: number; scrollLeft?: number },
) {
  Object.defineProperty(el, 'clientWidth', {
    configurable: true,
    get: () => metrics.clientWidth,
  });
  Object.defineProperty(el, 'scrollWidth', {
    configurable: true,
    get: () => metrics.scrollWidth,
  });
  let left = metrics.scrollLeft ?? 0;
  Object.defineProperty(el, 'scrollLeft', {
    configurable: true,
    get: () => left,
    set: (value: number) => {
      left = value;
    },
  });
  el.scrollBy = vi.fn(({ left: delta }: ScrollToOptions) => {
    left += Number(delta ?? 0);
  }) as typeof el.scrollBy;
}

function stubMatchMedia(nativeDesktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      // Default nativeScrollMinBreakpoint = lg (64rem / 1024px).
      const isNativeBp =
        query.includes('64rem') ||
        query.includes('1024px') ||
        query.includes('min-width: 1024') ||
        query.includes('80rem') ||
        query.includes('1280');
      const isReduced = query.includes('prefers-reduced-motion');
      return {
        matches: isReduced ? false : nativeDesktop && isNativeBp,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  );
}

function renderScroller(direction: 'ltr' | 'rtl' = 'ltr') {
  return render(
    <AzesThemeProvider direction={direction}>
      <AzesNavScroller prevLabel="Previous menus" nextLabel="Next menus" activeKey="a">
        <button type="button">Alpha</button>
        <button type="button" aria-current="page">
          Beta
        </button>
        <button type="button">Gamma</button>
      </AzesNavScroller>
    </AzesThemeProvider>,
  );
}

describe('AzesNavScroller', () => {
  beforeEach(() => {
    roCallback = null;
    // Default: tablet / below xl → arrow mode (jsdom width is not xl).
    stubMatchMedia(false);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(cb: RoCallback) {
          roCallback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not render arrows when content fits', async () => {
    const { container } = renderScroller();
    const scroller = container.querySelector('[data-azes-nav-scroller]') as HTMLElement;
    mockScrollerMetrics(scroller, { clientWidth: 400, scrollWidth: 300 });

    await act(async () => {
      roCallback?.([], {} as ResizeObserver);
    });

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Previous menus' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next menus' })).not.toBeInTheDocument();
    });
  });

  it('shows next arrow at start when overflowing, and scrolls by step ratio', async () => {
    const { container } = renderScroller();
    const scroller = container.querySelector('[data-azes-nav-scroller]') as HTMLElement;
    mockScrollerMetrics(scroller, { clientWidth: 200, scrollWidth: 600, scrollLeft: 0 });

    await act(async () => {
      roCallback?.([], {} as ResizeObserver);
    });

    const next = await screen.findByRole('button', { name: 'Next menus' });
    expect(screen.queryByRole('button', { name: 'Previous menus' })).not.toBeInTheDocument();

    fireEvent.click(next);
    expect(scroller.scrollBy).toHaveBeenCalledWith({
      left: 200 * 0.7,
      behavior: 'smooth',
    });
  });

  it('shows previous arrow when scrolled, and reverses step in RTL', async () => {
    const { container } = renderScroller('rtl');
    const scroller = container.querySelector('[data-azes-nav-scroller]') as HTMLElement;
    scroller.style.direction = 'rtl';
    mockScrollerMetrics(scroller, { clientWidth: 200, scrollWidth: 600, scrollLeft: -120 });

    await act(async () => {
      roCallback?.([], {} as ResizeObserver);
    });

    const prev = await screen.findByRole('button', { name: 'Previous menus' });
    fireEvent.click(prev);
    // direction -1 in RTL → positive scrollLeft delta
    expect(scroller.scrollBy).toHaveBeenCalledWith({
      left: 200 * 0.7,
      behavior: 'smooth',
    });
  });

  it('hides the scrollbar in arrow (tablet) mode', () => {
    const { container } = renderScroller();
    const root = container.querySelector('[data-azes-nav-scroller-root]') as HTMLElement;
    const scroller = container.querySelector('[data-azes-nav-scroller]') as HTMLElement;
    expect(root).toHaveAttribute('data-azes-nav-scroll-mode', 'arrows');
    expect(scroller).toHaveStyle({ scrollbarWidth: 'none' });
  });

  it('uses a visible native x-scrollbar on desktop web (lg+) and hides arrows', async () => {
    stubMatchMedia(true);
    const { container } = renderScroller();
    const root = container.querySelector('[data-azes-nav-scroller-root]') as HTMLElement;
    const scroller = container.querySelector('[data-azes-nav-scroller]') as HTMLElement;
    mockScrollerMetrics(scroller, { clientWidth: 200, scrollWidth: 600, scrollLeft: 0 });

    await act(async () => {
      roCallback?.([], {} as ResizeObserver);
    });

    expect(root).toHaveAttribute('data-azes-nav-scroll-mode', 'native');
    expect(screen.queryByRole('button', { name: 'Next menus' })).not.toBeInTheDocument();
    expect(scroller).toHaveStyle({ scrollbarWidth: 'thin' });
    // Overflowing desktop strip forces classic scroll gutter (not overlay-only).
    await waitFor(() => {
      expect(getComputedStyle(scroller).overflowX).toBe('scroll');
    });
  });

  it('uses fixed-width cells with ellipsis labels in the horizontal bar', async () => {
    const { AzesNavHorizontalBar } = await import('./AzesNavHorizontalBar');
    const { AzesNavProvider } = await import('./AzesNavProvider');
    const long = 'Very Long Menu Title Without Cut';
    render(
      <AzesThemeProvider>
        <AzesNavProvider router={{ pathname: '/long' }}>
          <AzesNavHorizontalBar
            config={[
              {
                id: 'g',
                items: [{ id: 'long', title: long, path: '/long' }],
              },
            ]}
          />
        </AzesNavProvider>
      </AzesThemeProvider>,
    );
    const link = screen.getByRole('link', { name: long });
    const label = within(link).getByText(long);
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    expect(getComputedStyle(label).whiteSpace).toBe('nowrap');
    expect(getComputedStyle(link).width).toBe(getComputedStyle(link).minWidth);
  });
});
