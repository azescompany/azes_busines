/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/layout.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-14
 * ║ Purpose: Dashboard/auth layout landmarks, mobile drawer, mini/horizontal, L-shell scoop
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AzesNavProvider } from '../navigation/AzesNavProvider';
import type { AzesNavConfig } from '../navigation/types';
import { AzesUiProvider } from '../settings/AzesSettingsProvider';
import { createAzesSettingsStore } from '../settings/store';
import { AzesDashboardLayout } from './AzesDashboardLayout';
import {
  canChromeAutoConceal,
  CHROME_CONCEAL_EXIT_OVERFLOW_PX,
  CHROME_MIN_CONCEAL_OVERFLOW_PX,
  CHROME_MIN_HIDE_SCROLL_PX,
  CHROME_SHOW_UP_PX,
  resolveBottomChromeLock,
  resolveChromeAutoHideLatch,
  resolveChromeShortPagePin,
} from './AzesHeader';
import { AzesAuthLayout } from './AzesSimpleLayouts';

const nav: AzesNavConfig = [
  {
    id: 'main',
    subheader: 'Main',
    items: [
      { id: 'home', title: 'Home', path: '/' },
      { id: 'reports', title: 'Reports', path: '/reports' },
    ],
  },
];

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

function renderDashboard(store = createAzesSettingsStore({ storage: 'none' }), extra?: ReactNode) {
  render(
    <AzesUiProvider store={store}>
      <AzesNavProvider router={{ pathname: '/reports', toHref: (path) => `#${path}` }}>
        <AzesDashboardLayout nav={nav} slots={{ logo: <span>Logo</span>, footer: 'Footer text' }}>
          <h1>Page</h1>
          {extra}
        </AzesDashboardLayout>
      </AzesNavProvider>
    </AzesUiProvider>,
  );
  return store;
}

describe('AzesDashboardLayout', () => {
  it('renders landmarks and a skip link targeting main', () => {
    renderDashboard();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Footer text');
    fireEvent.click(screen.getByRole('link', { name: 'Skip to content' }));
    expect(main).toHaveFocus();
  });

  it('opens the mobile drawer below the layout query and closes it after navigation', async () => {
    stubMatchMedia(false);
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const reports = await screen.findByRole('link', { name: 'Reports' });
    expect(reports).toHaveAttribute('aria-current', 'page');
    fireEvent.click(reports);
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument(),
    );
  });

  it('toggles mini mode through settings on desktop', () => {
    stubMatchMedia(true);
    const store = createAzesSettingsStore({ storage: 'none', defaults: { navLayout: 'vertical' } });
    renderDashboard(store);
    expect(screen.queryByRole('button', { name: 'Open navigation' })).not.toBeInTheDocument();
    // jsdom does not apply the `up(lg)` media rule, so the desktop nav is display:none here.
    fireEvent.click(screen.getByLabelText('Collapse navigation'));
    expect(store.getState().navLayout).toBe('mini');
    expect(screen.getByLabelText('Expand navigation')).toBeInTheDocument();
  });

  it('shows logo in dual chrome header and Apps trigger when menus hide', () => {
    stubMatchMedia(true);
    const store = renderDashboard();
    act(() => store.set({ navLayout: 'horizontal' }));
    const banner = screen.getByRole('banner');
    const nav = within(banner).getByLabelText('Primary');
    expect(banner.contains(nav)).toBe(true);
    expect(within(nav).getByText('Reports').closest('a')).toHaveAttribute('aria-current', 'page');
    // Desktop dual chrome: brand logo lives in the header start (left of language/profile).
    expect(within(banner).getByText('Logo')).toBeInTheDocument();

    const brandStrip = banner.querySelector('[data-azes-brand-strip]') as HTMLElement;
    expect(brandStrip).toBeTruthy();
    expect(brandStrip.getAttribute('data-azes-apps-collapsed')).toBe('false');

    fireEvent.click(within(nav).getByLabelText('Hide menus'));
    expect(within(banner).getByLabelText('Show menus')).toBeInTheDocument();
    expect(within(banner).getByText('Logo')).toBeInTheDocument();
    expect(brandStrip.getAttribute('data-azes-apps-collapsed')).toBe('true');

    fireEvent.click(within(banner).getByLabelText('Show menus'));
    expect(within(banner).getByLabelText('Hide menus')).toBeInTheDocument();
    expect(within(banner).getByLabelText('Primary')).toBeInTheDocument();
    expect(within(banner).getByText('Logo')).toBeInTheDocument();
    expect(brandStrip.getAttribute('data-azes-apps-collapsed')).toBe('false');
  });

  it('uses railNav for the docked mini rail under dual chrome', () => {
    stubMatchMedia(true);
    const railNav: AzesNavConfig = [
      {
        id: 'rail',
        items: [
          { id: 'rail-docs', title: 'Docs', path: '/docs' },
          { id: 'rail-ai', title: 'AI', path: '/ai' },
        ],
      },
    ];
    const store = createAzesSettingsStore({
      storage: 'none',
      defaults: { navLayout: 'horizontal' },
    });
    render(
      <AzesUiProvider store={store}>
        <AzesNavProvider router={{ pathname: '/docs', toHref: (path) => `#${path}` }}>
          <AzesDashboardLayout
            nav={nav}
            railNav={railNav}
            slots={{ logo: <span>Logo</span>, footer: 'Footer text' }}
          >
            <h1>Page</h1>
          </AzesDashboardLayout>
        </AzesNavProvider>
      </AzesUiProvider>,
    );
    const rail = document.querySelector('[data-azes-rail]') as HTMLElement;
    expect(rail).toBeTruthy();
    expect(rail.getAttribute('data-azes-rail-placement')).toBe('docked');
    const docs = within(rail).getByRole('link', { name: 'Docs', hidden: true });
    expect(docs).toHaveAttribute('aria-current', 'page');
    expect(within(rail).getByRole('link', { name: 'AI', hidden: true })).toBeInTheDocument();
    expect(
      within(rail).queryByRole('link', { name: 'Reports', hidden: true }),
    ).not.toBeInTheDocument();
    expect(within(screen.getByRole('banner')).getByText('Reports')).toBeInTheDocument();
  });

  it('honours headerMode fixed vs autoHide in settings', () => {
    stubMatchMedia(true);
    const store = renderDashboard();
    expect(store.getState().headerMode).toBe('autoHide');
    act(() => store.set({ headerMode: 'fixed' }));
    expect(store.getState().headerMode).toBe('fixed');
  });

  it('keeps the L-shell scoop as the scrollport with a curved join by default', () => {
    stubMatchMedia(true);
    renderDashboard();
    const column = document.querySelector('[data-azes-layout-column]') as HTMLElement;
    const scoop = document.querySelector('[data-azes-scoop]') as HTMLElement;
    expect(column).toBeTruthy();
    expect(scoop).toBeTruthy();
    // Column clips to the viewport; scoop scrolls internally (join does not scroll away).
    expect(getComputedStyle(column).overflow).toBe('hidden');
    expect(getComputedStyle(scoop).overflow).toBe('auto');
    expect(scoop.getAttribute('data-azes-scoop-join')).toBe('curve');
  });

  it('keeps L-shell rail + scoop for vertical, mini, and horizontal dual chrome', () => {
    stubMatchMedia(true);
    const store = renderDashboard();
    expect(document.querySelector('[data-azes-rail]')).toBeInTheDocument();
    expect(document.querySelector('[data-azes-scoop]')).toBeInTheDocument();
    act(() => store.set({ navLayout: 'mini' }));
    expect(document.querySelector('[data-azes-rail]')).toBeInTheDocument();
    expect(document.querySelector('[data-azes-scoop]')).toBeInTheDocument();
    act(() => store.set({ navLayout: 'horizontal' }));
    expect(document.querySelector('[data-azes-rail]')).toBeInTheDocument();
    expect(document.querySelector('[data-azes-scoop]')).toBeInTheDocument();
    expect(screen.getByRole('banner').querySelector('#azes-horizontal-menus')).toBeTruthy();
  });

  it('keeps chrome visible after Apps re-opens the horizontal toolbar', () => {
    stubMatchMedia(true);
    const store = renderDashboard();
    act(() => store.set({ navLayout: 'horizontal', headerMode: 'autoHide' }));
    const banner = screen.getByRole('banner');

    fireEvent.click(within(banner).getByLabelText('Hide menus'));
    fireEvent.click(within(banner).getByLabelText('Show menus'));

    expect(within(banner).getByLabelText('Hide menus')).toBeInTheDocument();
    expect(within(banner).getByLabelText('Primary')).toBeInTheDocument();
    expect(banner).not.toHaveStyle({ pointerEvents: 'none' });
  });

  it('keeps horizontal menus hidden across settings re-render (no layout remount)', () => {
    stubMatchMedia(true);
    const store = renderDashboard();
    act(() => store.set({ navLayout: 'horizontal' }));
    const banner = screen.getByRole('banner');

    fireEvent.click(within(banner).getByLabelText('Hide menus'));
    expect(within(banner).getByLabelText('Show menus')).toBeInTheDocument();

    // Density / other settings must not remount the shell and auto-show menus.
    // (Collapsed toolbar keeps Hide menus mounted but inert — Show menus is the signal.)
    act(() => store.set({ density: 'compact' }));
    expect(within(banner).getByLabelText('Show menus')).toBeInTheDocument();
  });

  it('applies the fixed container from settings', () => {
    const store = createAzesSettingsStore({ storage: 'none', defaults: { container: 'fixed' } });
    renderDashboard(store);
    const main = screen.getByRole('main');
    // Outer landmark stays full-bleed (scrollbar on scoop); inner column is capped.
    const inner = main.firstElementChild as HTMLElement;
    expect(inner).toBeTruthy();
    expect(getComputedStyle(inner).maxWidth).toBe('1280px');
  });

  it('keeps footer chrome full-bleed while Fixed caps the inner row', () => {
    const store = createAzesSettingsStore({ storage: 'none', defaults: { container: 'fixed' } });
    renderDashboard(store);
    const footer = document.querySelector('[data-azes-footer]') as HTMLElement;
    expect(footer).toBeTruthy();
    // Outer footer must not inherit the Fixed content cap (jsdom may report '').
    expect(getComputedStyle(footer).maxWidth).not.toBe('1280px');
    const inner = footer.firstElementChild as HTMLElement;
    expect(getComputedStyle(inner).maxWidth).toBe('1280px');
  });

  it('renders flush footer children without an inner content cap', () => {
    const store = createAzesSettingsStore({ storage: 'none', defaults: { container: 'fixed' } });
    render(
      <AzesUiProvider store={store}>
        <AzesNavProvider router={{ pathname: '/', toHref: (path) => `#${path}` }}>
          <AzesDashboardLayout
            nav={nav}
            slots={{ footer: <div data-testid="flush-band">Band</div> }}
            slotProps={{ footer: { flush: true } }}
          >
            Page
          </AzesDashboardLayout>
        </AzesNavProvider>
      </AzesUiProvider>,
    );
    const footer = document.querySelector('[data-azes-footer]') as HTMLElement;
    expect(footer.getAttribute('data-azes-footer-flush')).toBe('true');
    expect(screen.getByTestId('flush-band')).toBeInTheDocument();
    expect(footer.firstElementChild).toBe(screen.getByTestId('flush-band'));
  });

  it('skips main maxWidth when constrain is false (marketing full-bleed)', () => {
    const store = createAzesSettingsStore({ storage: 'none', defaults: { container: 'fixed' } });
    render(
      <AzesUiProvider store={store}>
        <AzesNavProvider router={{ pathname: '/', toHref: (path) => `#${path}` }}>
          <AzesDashboardLayout nav={nav} slotProps={{ main: { constrain: false } }}>
            Page
          </AzesDashboardLayout>
        </AzesNavProvider>
      </AzesUiProvider>,
    );
    const main = screen.getByRole('main');
    expect(main.getAttribute('data-azes-constrain')).toBe('false');
    const inner = main.firstElementChild as HTMLElement;
    expect(getComputedStyle(inner).maxWidth).toBe('none');
  });

  it('keeps scoop as the vertical scrollport by default (autoHide depends on it)', () => {
    stubMatchMedia(true);
    renderDashboard();
    const scoop = document.querySelector('[data-azes-scoop]') as HTMLElement;
    const main = screen.getByRole('main');
    expect(getComputedStyle(scoop).overflow).toBe('auto');
    // Default path must not create a nested vertical scrollport on main.
    expect(['auto', 'scroll', 'hidden']).not.toContain(getComputedStyle(main).overflowY);
  });
});

describe('AzesAuthLayout', () => {
  it('renders a centered card inside main', () => {
    render(
      <AzesUiProvider storage="none">
        <AzesAuthLayout slots={{ logo: <span>Logo</span> }}>
          <h1>Sign in</h1>
        </AzesAuthLayout>
      </AzesUiProvider>,
    );
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Sign in' }),
    );
  });

  it('hides the header and shows brand above the card', () => {
    render(
      <AzesUiProvider storage="none">
        <AzesAuthLayout
          hideHeader
          asideVariant="hero"
          slots={{
            brand: <span>Brand mark</span>,
            aside: <p>Aside copy</p>,
            asideBackdrop: <span>backdrop</span>,
          }}
        >
          <h1>Sign in</h1>
        </AzesAuthLayout>
      </AzesUiProvider>,
    );
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.getByText('Brand mark')).toBeTruthy();
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Sign in' }),
    );
  });
});

describe('resolveBottomChromeLock', () => {
  it('never locks on short scrollports (would trap header forever)', () => {
    expect(
      resolveBottomChromeLock({
        hide: true,
        fromBottom: 20,
        maxScroll: 80,
        currentlyLocked: false,
      }),
    ).toBe(false);
  });

  it('keeps lock on tiny scroll-up near the footer (hysteresis)', () => {
    expect(
      resolveBottomChromeLock({
        hide: false,
        fromBottom: 40,
        maxScroll: 800,
        currentlyLocked: true,
      }),
    ).toBe(true);
  });

  it('releases once scrolled clear of the bottom unlock band', () => {
    expect(
      resolveBottomChromeLock({
        hide: false,
        fromBottom: 200,
        maxScroll: 800,
        currentlyLocked: true,
      }),
    ).toBe(false);
  });

  it('locks while scrolling down near the bottom of a tall page', () => {
    expect(
      resolveBottomChromeLock({
        hide: true,
        fromBottom: 40,
        maxScroll: 800,
        currentlyLocked: false,
      }),
    ).toBe(true);
  });
});

describe('canChromeAutoConceal', () => {
  it('blocks conceal until scrollTop reaches min hide depth', () => {
    expect(
      canChromeAutoConceal({
        scrollTop: CHROME_MIN_HIDE_SCROLL_PX - 1,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX + 40,
      }),
    ).toBe(false);
    expect(
      canChromeAutoConceal({
        scrollTop: CHROME_MIN_HIDE_SCROLL_PX,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX + 40,
      }),
    ).toBe(true);
  });

  it('blocks conceal when overflow cannot survive chrome collapse + hide/show travel', () => {
    expect(
      canChromeAutoConceal({
        scrollTop: 200,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX - 1,
      }),
    ).toBe(false);
  });
});

describe('resolveChromeShortPagePin', () => {
  it('arms pin on force-reveal and holds until ENTER overflow recovers', () => {
    expect(
      resolveChromeShortPagePin({
        pinned: false,
        maxScroll: CHROME_CONCEAL_EXIT_OVERFLOW_PX + 10,
        armPin: true,
      }),
    ).toEqual({ pinned: true });

    expect(
      resolveChromeShortPagePin({
        pinned: true,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX - 1,
      }),
    ).toEqual({ pinned: true });

    expect(
      resolveChromeShortPagePin({
        pinned: true,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX,
      }),
    ).toEqual({ pinned: false });
  });

  it('does not pin when not armed and overflow is healthy', () => {
    expect(
      resolveChromeShortPagePin({
        pinned: false,
        maxScroll: CHROME_MIN_CONCEAL_OVERFLOW_PX + 80,
      }),
    ).toEqual({ pinned: false });
  });
});

describe('resolveChromeAutoHideLatch', () => {
  it('latches conceal on scroll-down and starts settle', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: true,
        latched: false,
        scrollTop: 200,
        concealBaselineY: 0,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: false,
      }),
    ).toEqual({
      concealed: true,
      latched: true,
      concealBaselineY: 200,
      beginSettle: true,
    });
  });

  it('freezes latched state while settling (absorbs scrollTop compensation thrash)', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: false,
        latched: true,
        scrollTop: 240,
        concealBaselineY: 200,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: true,
      }),
    ).toEqual({
      concealed: true,
      latched: true,
      concealBaselineY: 200,
      beginSettle: false,
    });
  });

  it('does not freeze settle when scrollTop clamped to 0 (short-page recovery)', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: true,
        latched: true,
        scrollTop: 0,
        concealBaselineY: 200,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: true,
      }),
    ).toEqual({
      concealed: false,
      latched: false,
      concealBaselineY: 0,
      beginSettle: true,
    });
  });

  it('keeps chrome hidden when direction says show but scroll-up travel is insufficient', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: false,
        latched: true,
        scrollTop: 190,
        concealBaselineY: 200,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: false,
      }),
    ).toEqual({
      concealed: true,
      latched: true,
      concealBaselineY: 200,
      beginSettle: false,
    });
  });

  it('releases only after real scroll-up past show hysteresis', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: false,
        latched: true,
        scrollTop: 200 - CHROME_SHOW_UP_PX,
        concealBaselineY: 200,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: false,
      }),
    ).toEqual({
      concealed: false,
      latched: false,
      concealBaselineY: 200,
      beginSettle: true,
    });
  });

  it('tracks peak scroll while latched so show-up is measured from deepest point', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: true,
        latched: true,
        scrollTop: 360,
        concealBaselineY: 200,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: false,
      }),
    ).toEqual({
      concealed: true,
      latched: true,
      concealBaselineY: 360,
      beginSettle: false,
    });
  });

  it('releases at scrollTop 0 even when baseline hysteresis cannot be met (short page)', () => {
    expect(
      resolveChromeAutoHideLatch({
        wantConcealed: true,
        latched: true,
        scrollTop: 0,
        concealBaselineY: 180,
        showUpPx: CHROME_SHOW_UP_PX,
        settling: false,
      }),
    ).toEqual({
      concealed: false,
      latched: false,
      concealBaselineY: 0,
      beginSettle: true,
    });
  });
});
