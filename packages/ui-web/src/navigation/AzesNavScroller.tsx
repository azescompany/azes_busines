/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavScroller.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Horizontal nav strip — desktop native x-scroll / md arrows
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';

import { IconChevronLeft, IconChevronRight } from '../icons';

export type AzesNavScrollerProps = {
  children: ReactNode;
  /** i18n: previous menus. */
  prevLabel: string;
  /** i18n: next menus. */
  nextLabel: string;
  /** Re-run overflow + scroll active into view when this changes (e.g. active trail). */
  activeKey?: string;
};

type ScrollFlags = {
  overflow: boolean;
  canStart: boolean;
  canEnd: boolean;
};

function readFlags(el: HTMLElement, tolerance: number): ScrollFlags {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const overflow = max > tolerance;
  if (!overflow) {
    return { overflow: false, canStart: false, canEnd: false };
  }
  const left = el.scrollLeft;
  const rtl = getComputedStyle(el).direction === 'rtl';
  if (rtl) {
    const abs = Math.abs(left);
    return {
      overflow: true,
      canStart: abs > tolerance,
      canEnd: abs < max - tolerance,
    };
  }
  return {
    overflow: true,
    canStart: left > tolerance,
    canEnd: left < max - tolerance,
  };
}

function scrollElementIntoScroller(
  scroller: HTMLElement,
  target: HTMLElement,
  edgePad: number,
): void {
  const scrollerRect = scroller.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const rtl = getComputedStyle(scroller).direction === 'rtl';
  let delta = 0;
  if (targetRect.left < scrollerRect.left) {
    delta = targetRect.left - scrollerRect.left - edgePad;
  } else if (targetRect.right > scrollerRect.right) {
    delta = targetRect.right - scrollerRect.right + edgePad;
  }
  if (!delta) return;
  scroller.scrollBy({
    left: rtl ? -delta : delta,
    behavior: 'auto',
  });
}

export function AzesNavScroller({
  children,
  prevLabel,
  nextLabel,
  activeKey,
}: AzesNavScrollerProps) {
  const theme = useTheme();
  const scrollerTokens = theme.azes.navScroller;
  const listId = useId();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const [flags, setFlags] = useState<ScrollFlags>({
    overflow: false,
    canStart: false,
    canEnd: false,
  });
  const [reducedMotion, setReducedMotion] = useState(false);
  const rtl = theme.direction === 'rtl';
  const StartChevron = rtl ? IconChevronRight : IconChevronLeft;
  const EndChevron = rtl ? IconChevronLeft : IconChevronRight;

  /** Desktop web: native x-scrollbar. Below (`md`): arrow controls. */
  const isNativeScroll = useMediaQuery(
    theme.breakpoints.up(scrollerTokens.nativeScrollMinBreakpoint),
    { noSsr: true },
  );
  const arrowMode = !isNativeScroll;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const syncFlags = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = readFlags(el, scrollerTokens.edgeTolerancePx);
    setFlags((prev) =>
      prev.overflow === next.overflow &&
      prev.canStart === next.canStart &&
      prev.canEnd === next.canEnd
        ? prev
        : next,
    );
  }, [scrollerTokens.edgeTolerancePx]);

  const scheduleSync = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      syncFlags();
    });
  }, [syncFlags]);

  useEffect(() => {
    const el = scrollerRef.current;
    const content = contentRef.current;
    if (!el) return undefined;

    syncFlags();
    el.addEventListener('scroll', scheduleSync, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => scheduleSync());
      ro.observe(el);
      if (content) ro.observe(content);
    }

    window.addEventListener('resize', scheduleSync);
    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('scroll', scheduleSync);
      ro?.disconnect();
      window.removeEventListener('resize', scheduleSync);
    };
  }, [scheduleSync, syncFlags, children]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      scrollElementIntoScroller(el, active, scrollerTokens.edgeTolerancePx * 4);
    }
    scheduleSync();
  }, [activeKey, scheduleSync, children, scrollerTokens.edgeTolerancePx]);

  const scrollByStep = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const isRtl = getComputedStyle(el).direction === 'rtl';
    const step = el.clientWidth * scrollerTokens.scrollStepRatio;
    const sign = isRtl ? -direction : direction;
    el.scrollBy({
      left: sign * step,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  const onFocusCapture = (event: FocusEvent) => {
    const el = scrollerRef.current;
    const target = event.target;
    if (!el || !(target instanceof HTMLElement) || !el.contains(target)) return;
    if (target === el) return;
    scrollElementIntoScroller(el, target, scrollerTokens.edgeTolerancePx * 4);
    scheduleSync();
  };

  const arrowSize = theme.spacing(scrollerTokens.arrowSizeSpacing);
  const fadeWidth = theme.spacing(scrollerTokens.fadeWidthSpacing);
  const scrollbarSize = theme.spacing(scrollerTokens.scrollbarSizeSpacing);
  const showStartArrow = arrowMode && flags.canStart;
  const showEndArrow = arrowMode && flags.canEnd;
  const fadeStart = arrowMode && flags.canStart ? fadeWidth : '0px';
  const fadeEnd = arrowMode && flags.canEnd ? fadeWidth : '0px';
  const mask =
    arrowMode && flags.overflow
      ? `linear-gradient(to inline-end, transparent 0, black ${fadeStart}, black calc(100% - ${fadeEnd}), transparent 100%)`
      : 'none';

  const primary = theme.vars.palette.primary.main;
  const secondary = theme.vars.palette.secondary.main;
  const white = theme.vars.palette.common.white;
  const thumb = `color-mix(in srgb, ${white} 55%, transparent)`;
  const thumbStrong = `color-mix(in srgb, ${white} 78%, transparent)`;
  const track = `color-mix(in srgb, ${theme.vars.palette.common.black} 45%, ${white} 12%)`;

  const arrowSx = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    minWidth: arrowSize,
    minHeight: arrowSize,
    width: arrowSize,
    height: arrowSize,
    p: 0,
    color: white,
    bgcolor: primary,
    border: `1px solid ${secondary}`,
    borderRadius: `${theme.shape.radiusSm}px`,
    boxShadow: 'none',
    '& .MuiSvgIcon-root': {
      fontSize: theme.typography.pxToRem(scrollerTokens.iconSizePx),
      color: white,
    },
    '&:hover': {
      bgcolor: `color-mix(in srgb, ${white} 10%, ${primary})`,
      border: `1px solid ${secondary}`,
      color: white,
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: 2,
    },
    '@media (forced-colors: active)': {
      border: '1px solid CanvasText',
      bgcolor: 'ButtonFace',
      color: 'ButtonText',
      forcedColorAdjust: 'auto',
    },
  };

  return (
    <Box
      data-azes-nav-scroller-root=""
      data-azes-nav-scroll-mode={arrowMode ? 'arrows' : 'native'}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        height: '100%',
        flex: '1 1 auto',
      }}
    >
      {showStartArrow ? (
        <IconButton
          type="button"
          size="small"
          color="inherit"
          aria-label={prevLabel}
          aria-controls={listId}
          onClick={() => scrollByStep(-1)}
          sx={{ ...arrowSx, insetInlineStart: 0 }}
        >
          <StartChevron fontSize="small" aria-hidden />
        </IconButton>
      ) : null}

      <Box
        ref={scrollerRef}
        id={listId}
        onFocusCapture={onFocusCapture}
        data-azes-nav-scroller=""
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          maxWidth: '100%',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          // Keep classic x-scrollbar inside the fixed toolbar height (not clipped away).
          paddingBottom: arrowMode ? 0 : scrollbarSize,
          overflowX: !arrowMode && flags.overflow ? 'scroll' : 'auto',
          overflowY: 'hidden',
          scrollBehavior: reducedMotion ? 'auto' : 'smooth',
          maskImage: mask,
          WebkitMaskImage: mask,
          ...(arrowMode
            ? {
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                '&::-webkit-scrollbar': { display: 'none', height: 0 },
              }
            : {
                // Always paint a readable thin bar when the strip overflows (not hover-only).
                scrollbarWidth: 'thin',
                scrollbarColor: `${thumb} ${track}`,
                '&::-webkit-scrollbar': {
                  height: scrollbarSize,
                  display: 'block',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: thumb,
                  borderRadius: theme.shape.radiusFull,
                  border: `1px solid color-mix(in srgb, ${white} 20%, transparent)`,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: track,
                  borderRadius: theme.shape.radiusFull,
                },
                '&:hover': {
                  scrollbarColor: `${thumbStrong} ${track}`,
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: thumbStrong,
                  },
                },
              }),
        }}
      >
        <Box
          ref={contentRef}
          data-azes-nav-scroller-content=""
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: flags.overflow ? 'flex-start' : 'center',
            height: '100%',
            width: 'max-content',
            minWidth: '100%',
            maxWidth: 'none',
          }}
        >
          {children}
        </Box>
      </Box>

      {showEndArrow ? (
        <IconButton
          type="button"
          size="small"
          color="inherit"
          aria-label={nextLabel}
          aria-controls={listId}
          onClick={() => scrollByStep(1)}
          sx={{ ...arrowSx, insetInlineEnd: 0 }}
        >
          <EndChevron fontSize="small" aria-hidden />
        </IconButton>
      ) : null}
    </Box>
  );
}
