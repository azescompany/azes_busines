/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesHeader.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-15
 * ║ Purpose: App bar auto-hide — bottom lock hysteresis (no footer snap)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { navToneVars, type AzesNavTone } from '../navigation/navStyles';
import { CHROME_ICON_BUTTON_PX, chromeInlinePadding } from './chromeMetrics';

export type AzesHeaderProps = {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  /** Full-width strip above the header row (e.g. horizontal menus toolbar). */
  top?: ReactNode;
  /** Full-width row under the header (legacy / secondary). */
  bottom?: ReactNode;
  /** Adds a shadow once the page scrolls. Default `true`. */
  elevateOnScroll?: boolean;
  /**
   * Adobe-style chrome: hide while scrolling down; show on scroll up.
   * L-shell collapses height (no leftover white band). Bottom-edge lock stops
   * scoop resize clamp from flip-flopping conceal. Settle lock + show-up
   * hysteresis absorb scrollTop compensation jitter.
   */
  hideOnScroll?: boolean;
  /** Keep chrome visible while true (hard pin). */
  forceVisible?: boolean;
  /**
   * Increment after Apps re-opens the toolbar. Chrome stays visible on that
   * same render (no effect lag), then auto-hide resumes only after a real
   * scroll-down past the post-open baseline.
   */
  visibilityPin?: number;
  /**
   * L-shell: solid paper chrome; height collapse so content fills the gap.
   */
  chromeJoin?: boolean;
  /**
   * Scroll container for elevate / auto-hide / visibility pin.
   * L-shell passes the scoop scrollport; otherwise defaults to the window.
   */
  scrollTarget?: Node | Window | null;
  /** Shared with sidebar — integrated vs contrast navigation surface. */
  tone?: AzesNavTone;
  /**
   * Fires when auto-hide conceal changes (L-shell scoop join radius syncs here).
   */
  onConcealedChange?: (concealed: boolean) => void;
};

const BOTTOM_EDGE_PX = 96;
const BOTTOM_UNLOCK_PX = 160;
/** Header collapse / scoop-join motion — keep in sync with DashboardLayout scoop. */
export const CHROME_MOTION_MS = 320;
/**
 * Freeze conceal after collapse/expand while scrollTop is compensated.
 * Must cover full chrome motion + a frame buffer (otherwise ResizeObserver thrash).
 */
export const CHROME_SETTLE_MS = CHROME_MOTION_MS + 120;
/** Real scroll-up travel required before chrome may reappear after a conceal latch. */
export const CHROME_SHOW_UP_PX = 32;
/**
 * Min `scrollTop` before chrome may hide. Avoids micro-scroll thrash on short pages.
 */
export const CHROME_MIN_HIDE_SCROLL_PX = 60;
/**
 * Dual chrome collapse frees ~header (56) + menus (56). Overflow must stay larger than
 * that plus show-up travel after collapse, or the user cannot scroll chrome back.
 */
export const CHROME_COLLAPSE_BUDGET_PX = 112;
/** Extra slack so post-collapse scoop still feels stably scrollable. */
export const CHROME_OVERFLOW_BUFFER_PX = 80;
/**
 * ENTER threshold: overflow before conceal must survive collapse AND leave
 * hide-depth + show-up room. Short pages never latch → no hide↔show jitter.
 */
export const CHROME_MIN_CONCEAL_OVERFLOW_PX =
  CHROME_COLLAPSE_BUDGET_PX +
  CHROME_MIN_HIDE_SCROLL_PX +
  CHROME_SHOW_UP_PX +
  CHROME_OVERFLOW_BUFFER_PX;
/**
 * EXIT threshold: if overflow collapses below this while latched → force-reveal
 * and arm short-page pin (hysteresis vs ENTER).
 */
export const CHROME_CONCEAL_EXIT_OVERFLOW_PX = CHROME_MIN_HIDE_SCROLL_PX + CHROME_SHOW_UP_PX;

function readScrollTop(target: Node | Window | null | undefined): number {
  if (!target || target === window) return window.scrollY;
  if (target instanceof Element) return target.scrollTop;
  return window.scrollY;
}

function readMaxScroll(target: Node | Window | null | undefined): number {
  if (target instanceof Element) {
    return Math.max(0, target.scrollHeight - target.clientHeight);
  }
  const doc = document.documentElement;
  return Math.max(0, doc.scrollHeight - window.innerHeight);
}

function readDistanceFromBottom(target: Node | Window | null | undefined): number {
  if (target instanceof Element) {
    return target.scrollHeight - target.clientHeight - target.scrollTop;
  }
  const doc = document.documentElement;
  return doc.scrollHeight - window.innerHeight - window.scrollY;
}

/**
 * Bottom-edge lock stops scoop resize clamp from flip-flopping conceal.
 * Unlock uses distance-from-bottom hysteresis (not tiny scroll-up flips) so the
 * footer does not snap when chrome would re-expand over infinite-load growth.
 * Must not trap chrome on short pages where `fromBottom` never exceeds unlock.
 */
export function resolveBottomChromeLock(input: {
  hide: boolean;
  fromBottom: number;
  maxScroll: number;
  currentlyLocked: boolean;
}): boolean {
  const { hide, fromBottom, maxScroll, currentlyLocked } = input;
  // Not enough travel to clear BOTTOM_UNLOCK_PX — locking would hide chrome forever.
  if (maxScroll <= BOTTOM_UNLOCK_PX) return false;
  // Clear of the bottom band → always release (real scroll-up away from footer).
  if (fromBottom > BOTTOM_UNLOCK_PX) return false;
  // Enter lock while scrolling down inside the edge band.
  if (hide && fromBottom <= BOTTOM_EDGE_PX) return true;
  // Between edge and unlock: keep prior lock (absorbs direction jitter at footer).
  return currentlyLocked;
}

export type ChromeAutoHideLatchInput = {
  /** MUI direction trigger: true while scrolling down past threshold. */
  wantConcealed: boolean;
  latched: boolean;
  scrollTop: number;
  concealBaselineY: number;
  showUpPx: number;
  settling: boolean;
};

export type ChromeAutoHideLatchResult = {
  concealed: boolean;
  latched: boolean;
  concealBaselineY: number;
  /** Caller should start a settle window when true. */
  beginSettle: boolean;
};

/**
 * Gate: enough scroll depth + enough leftover overflow after chrome collapse.
 * Short pages fail this and keep the header pinned (no trap / no jitter).
 */
export function canChromeAutoConceal(input: {
  scrollTop: number;
  maxScroll: number;
  minScrollPx?: number;
  minOverflowPx?: number;
}): boolean {
  const minScroll = input.minScrollPx ?? CHROME_MIN_HIDE_SCROLL_PX;
  const minOverflow = input.minOverflowPx ?? CHROME_MIN_CONCEAL_OVERFLOW_PX;
  return input.scrollTop >= minScroll && input.maxScroll >= minOverflow;
}

export type ChromeShortPagePinInput = {
  /** Currently pinned because page is too short for safe auto-hide. */
  pinned: boolean;
  maxScroll: number;
  /**
   * True when we just force-revealed (overflow died / scrollTop clamped to 0).
   * Arms the pin so conceal cannot restart until ENTER overflow recovers.
   */
  armPin?: boolean;
  enterOverflowPx?: number;
};

/**
 * Short-page pin with enter/exit hysteresis.
 * Once armed, auto-hide stays off until overflow recovers past ENTER —
 * stops hide→collapse→clamp→show→hide loops on marginal viewports.
 */
export function resolveChromeShortPagePin(input: ChromeShortPagePinInput): { pinned: boolean } {
  const enter = input.enterOverflowPx ?? CHROME_MIN_CONCEAL_OVERFLOW_PX;
  if (input.armPin) return { pinned: true };
  if (input.pinned) {
    return { pinned: input.maxScroll < enter };
  }
  return { pinned: false };
}

/**
 * Latch conceal on scroll-down; require real scroll-up travel before reveal.
 * While `settling`, freeze the previous latched/concealed pair (caller keeps state).
 *
 * Short pages: after L-shell chrome collapses, scoop grows and `scrollTop` clamps to 0
 * while the latch baseline stays high — `scrollTop <= baseline - showUpPx` can never
 * pass. Always reveal at the top (`scrollTop <= 0`).
 */
export function resolveChromeAutoHideLatch(
  input: ChromeAutoHideLatchInput,
): ChromeAutoHideLatchResult {
  const { wantConcealed, latched, scrollTop, concealBaselineY, showUpPx, settling } = input;

  // At the top of the scrollport chrome must be visible (short-page clamp recovery).
  // Checked before settle freeze — collapse compensation often clamps to 0.
  if (scrollTop <= 0) {
    return {
      concealed: false,
      latched: false,
      concealBaselineY: 0,
      beginSettle: latched,
    };
  }

  if (settling) {
    return {
      concealed: latched,
      latched,
      concealBaselineY,
      beginSettle: false,
    };
  }

  if (wantConcealed) {
    if (!latched) {
      return {
        concealed: true,
        latched: true,
        concealBaselineY: scrollTop,
        beginSettle: true,
      };
    }
    return {
      concealed: true,
      latched: true,
      // Track peak so show-up is measured from the deepest scroll while hidden.
      concealBaselineY: Math.max(concealBaselineY, scrollTop),
      beginSettle: false,
    };
  }

  // Direction says "show", but keep chrome hidden until enough upward travel.
  if (latched) {
    if (scrollTop <= concealBaselineY - showUpPx) {
      return {
        concealed: false,
        latched: false,
        concealBaselineY,
        beginSettle: true,
      };
    }
    return {
      concealed: true,
      latched: true,
      concealBaselineY,
      beginSettle: false,
    };
  }

  return {
    concealed: false,
    latched: false,
    concealBaselineY,
    beginSettle: false,
  };
}

export function AzesHeader({
  start,
  center,
  end,
  top,
  bottom,
  elevateOnScroll = true,
  hideOnScroll = false,
  forceVisible = false,
  visibilityPin = 0,
  chromeJoin = false,
  scrollTarget = null,
  tone = 'integrated',
  onConcealedChange,
}: AzesHeaderProps) {
  const triggerOpts = scrollTarget ? { target: scrollTarget } : {};
  const scrolled = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    ...triggerOpts,
  });
  // Direction-aware: true while scrolling down past min hide depth.
  const hide = useScrollTrigger({ threshold: CHROME_MIN_HIDE_SCROLL_PX, ...triggerOpts });
  /** Last `visibilityPin` value that was released by a real scroll-down. */
  const [releasedPin, setReleasedPin] = useState(0);
  // Same-render pin: true as soon as Apps bumps visibilityPin (before effects).
  const pinned = visibilityPin > 0 && visibilityPin > releasedPin;
  /** Sticky conceal near the bottom so scoop resize clamp cannot flip-flop. */
  const [bottomLocked, setBottomLocked] = useState(false);
  /** Direction latch after settle/hysteresis (ignores compensation thrash). */
  const [latchedConcealed, setLatchedConcealed] = useState(false);
  const wasConcealedRef = useRef(false);
  /** Scoop clientHeight before last conceal — used to restore scrollTop after collapse. */
  const scoopClientBeforeConcealRef = useRef(0);
  const settleUntilRef = useRef(0);
  const concealBaselineYRef = useRef(0);
  const latchedRef = useRef(false);
  /**
   * After a forced reveal on a short/marginal page, block re-conceal until
   * overflow recovers past ENTER — kills hide↔show oscillation.
   */
  const shortPagePinnedRef = useRef(false);

  const beginSettle = () => {
    settleUntilRef.current = performance.now() + CHROME_SETTLE_MS;
  };

  const clearConcealState = () => {
    latchedRef.current = false;
    concealBaselineYRef.current = 0;
    settleUntilRef.current = 0;
    setLatchedConcealed(false);
    setBottomLocked(false);
  };

  useLayoutEffect(() => {
    if (visibilityPin <= 0 || visibilityPin <= releasedPin) return undefined;

    const node: Node | Window = scrollTarget ?? window;
    let startY = readScrollTop(scrollTarget);
    let listening = false;

    // Re-baseline after toolbar expand settles so thrash cannot look like scroll-down.
    const enableId = window.setTimeout(() => {
      startY = readScrollTop(scrollTarget);
      listening = true;
    }, CHROME_SETTLE_MS);

    const onScroll = () => {
      if (!listening) return;
      if (readScrollTop(scrollTarget) > startY + 24) {
        setReleasedPin(visibilityPin);
        node.removeEventListener('scroll', onScroll);
      }
    };

    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(enableId);
      node.removeEventListener('scroll', onScroll);
    };
  }, [visibilityPin, releasedPin, scrollTarget]);

  // Latch + settle + bottom lock — single scroll sync so compensation cannot flip-flop.
  useLayoutEffect(() => {
    if (!hideOnScroll) {
      shortPagePinnedRef.current = false;
      clearConcealState();
      return undefined;
    }

    const node: Node | Window = scrollTarget ?? window;

    const sync = () => {
      if (forceVisible || pinned) {
        shortPagePinnedRef.current = false;
        clearConcealState();
        return;
      }

      const now = performance.now();
      const settling = now < settleUntilRef.current;
      const scrollTop = readScrollTop(scrollTarget);
      const maxScroll = readMaxScroll(scrollTarget);

      // Release short-page pin only when overflow recovers past ENTER (hysteresis).
      shortPagePinnedRef.current = resolveChromeShortPagePin({
        pinned: shortPagePinnedRef.current,
        maxScroll,
      }).pinned;

      if (shortPagePinnedRef.current) {
        if (latchedRef.current) clearConcealState();
        return;
      }

      // Capacity died or scroll clamped to top after collapse → reveal + pin.
      // Check even while settling: compensation often clamps scrollTop to 0 mid-motion.
      const capacityDead = maxScroll < CHROME_CONCEAL_EXIT_OVERFLOW_PX;
      if (latchedRef.current && (capacityDead || scrollTop <= 0)) {
        shortPagePinnedRef.current = resolveChromeShortPagePin({
          pinned: shortPagePinnedRef.current,
          maxScroll,
          armPin: true,
        }).pinned;
        clearConcealState();
        return;
      }

      const wasLatched = latchedRef.current;
      const next = resolveChromeAutoHideLatch({
        wantConcealed:
          hide && !shortPagePinnedRef.current && canChromeAutoConceal({ scrollTop, maxScroll }),
        latched: latchedRef.current,
        scrollTop,
        concealBaselineY: concealBaselineYRef.current,
        showUpPx: CHROME_SHOW_UP_PX,
        settling,
      });

      // Latch released because scrollTop hit 0 inside resolveChromeAutoHideLatch.
      if (wasLatched && !next.latched && scrollTop <= 0) {
        shortPagePinnedRef.current = true;
      }

      latchedRef.current = next.latched;
      concealBaselineYRef.current = next.concealBaselineY;
      if (next.beginSettle) beginSettle();
      setLatchedConcealed(next.concealed);

      setBottomLocked((prev) =>
        resolveBottomChromeLock({
          hide,
          fromBottom: readDistanceFromBottom(scrollTarget),
          maxScroll,
          currentlyLocked: prev,
        }),
      );
    };

    sync();
    node.addEventListener('scroll', sync, { passive: true });
    // ResizeObserver: short pages lose overflow when chrome collapses — re-sync.
    let ro: ResizeObserver | undefined;
    if (scrollTarget instanceof Element && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        sync();
      });
      ro.observe(scrollTarget);
    }
    return () => {
      node.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [hideOnScroll, hide, forceVisible, pinned, scrollTarget]);

  const concealed = Boolean(
    hideOnScroll && (latchedConcealed || bottomLocked) && !forceVisible && !pinned,
  );

  useLayoutEffect(() => {
    onConcealedChange?.(concealed);
  }, [concealed, onConcealedChange]);

  // After L-shell height collapse/expand, keep scroll position stable (no clamp thrash).
  useLayoutEffect(() => {
    if (!chromeJoin || !hideOnScroll) {
      wasConcealedRef.current = concealed;
      return;
    }

    if (!(scrollTarget instanceof Element)) {
      wasConcealedRef.current = concealed;
      return;
    }

    const becameConcealed = concealed && !wasConcealedRef.current;
    wasConcealedRef.current = concealed;

    if (becameConcealed) {
      const beforeClient = scoopClientBeforeConcealRef.current;
      const afterClient = scrollTarget.clientHeight;
      const gained = Math.max(0, afterClient - beforeClient);
      const top = scrollTarget.scrollTop;
      // Scoop grew by collapsing chrome — nudge scrollTop so MUI does not read a scroll-up.
      if (gained > 0) {
        scrollTarget.scrollTop = top + gained;
      }
      // Hysteresis baseline = post-compensation position; settle absorbs the synthetic scroll.
      concealBaselineYRef.current = readScrollTop(scrollTarget);
      beginSettle();

      const maxAfter = readMaxScroll(scrollTarget);
      // Collapse left too little overflow → abort conceal immediately + pin short page.
      if (maxAfter < CHROME_CONCEAL_EXIT_OVERFLOW_PX || readScrollTop(scrollTarget) <= 0) {
        shortPagePinnedRef.current = true;
        clearConcealState();
        return;
      }

      // Near footer: lock conceal only. Do NOT pin-to-bottom — that yanks the
      // viewport when infinite lists grow under the footer (footer "snaps up").
      // `scrollTop += gained` above already keeps the same content in view.
      if (readDistanceFromBottom(scrollTarget) <= BOTTOM_EDGE_PX + 24) {
        setBottomLocked(true);
        concealBaselineYRef.current = readScrollTop(scrollTarget);
      }
      return;
    }

    // Do NOT pin-to-bottom on becameVisible. Re-gluing to max scroll cancels the
    // upward travel that just revealed chrome (ScrollToTop / PageUp from the footer).
    // Conceal-side compensation + bottomLocked already stabilize scoop resize.

    // While visible, cache scoop size for the next conceal compensation.
    if (!concealed) {
      scoopClientBeforeConcealRef.current = scrollTarget.clientHeight;
    }
  }, [concealed, chromeJoin, hideOnScroll, scrollTarget]);

  const elevated = elevateOnScroll && scrolled;

  const body = (
    <>
      {top}
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: `${theme.azes.layout.pagePaddingXs}px`,
          minHeight: 'var(--azes-layout-header-height)',
          paddingInline: chromeInlinePadding(theme),
          width: '100%',
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>{start}</Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            minWidth: 0,
            justifyContent: 'center',
          }}
        >
          {center}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>{end}</Box>
      </Box>
      {bottom}
    </>
  );

  // L-shell: collapse height so the scoop fills the gap (no leftover white band).
  if (chromeJoin) {
    return (
      <Box
        component="header"
        sx={(theme) => ({
          ...navToneVars(theme, tone),
          position: 'relative',
          zIndex: theme.zIndex.appBar,
          flexShrink: 0,
          display: 'grid',
          gridTemplateRows: concealed ? '0fr' : '1fr',
          backgroundColor: 'var(--azes-nav-bg)',
          color: 'var(--azes-nav-text-strong)',
          pointerEvents: concealed ? 'none' : 'auto',
          // Density-immune chrome: min hit target locked; width stays auto (locale chip).
          '& .MuiIconButton-root': {
            color: 'var(--azes-nav-text-strong)',
            minWidth: CHROME_ICON_BUTTON_PX,
            minHeight: CHROME_ICON_BUTTON_PX,
          },
          '& .MuiSvgIcon-root': { color: 'currentColor' },
          transition: theme.transitions.create(
            ['grid-template-rows', 'background-color', 'color'],
            {
              duration: CHROME_MOTION_MS,
              easing: theme.transitions.easing.easeInOut,
            },
          ),
        })}
      >
        <Box
          sx={(theme) => ({
            overflow: 'hidden',
            minHeight: 0,
            opacity: concealed ? 0 : 1,
            transform: concealed ? 'translateY(-10px)' : 'translateY(0)',
            transition: theme.transitions.create(['opacity', 'transform'], {
              duration: CHROME_MOTION_MS,
              easing: theme.transitions.easing.easeInOut,
            }),
          })}
        >
          {body}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component="header"
      sx={(theme) => ({
        ...navToneVars(theme, tone),
        position: 'sticky',
        insetBlockStart: 0,
        zIndex: theme.zIndex.appBar,
        flexShrink: 0,
        backgroundColor: 'var(--azes-nav-bg)',
        color: 'var(--azes-nav-text-strong)',
        backdropFilter: `blur(${theme.spacing(2)})`,
        boxShadow: elevated ? theme.azes.customShadows.nav : 'none',
        transform: concealed ? 'translateY(-110%)' : 'translateY(0)',
        pointerEvents: concealed ? 'none' : 'auto',
        '& .MuiIconButton-root': {
          color: 'var(--azes-nav-text-strong)',
          minWidth: CHROME_ICON_BUTTON_PX,
          minHeight: CHROME_ICON_BUTTON_PX,
        },
        '& .MuiSvgIcon-root': { color: 'currentColor' },
        transition: theme.transitions.create(
          ['box-shadow', 'transform', 'background-color', 'color'],
          {
            duration: CHROME_MOTION_MS,
            easing: theme.transitions.easing.easeInOut,
          },
        ),
      })}
    >
      {body}
    </Box>
  );
}
