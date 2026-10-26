/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesScrollToTop.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-13
 * ║ Purpose: Circular back-to-top with white arrow + scroll-progress ring
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useCallback, useEffect, useState } from 'react';

import { CHROME_SETTLE_MS } from './AzesHeader';

export type AzesScrollToTopProps = {
  /** L-shell scoop scrollport; omit to use `window`. */
  scrollTarget?: Element | null;
  /** Show after this many px of scroll. Default 240. */
  threshold?: number;
  /** Accessible name (i18n). */
  label?: string;
};

const SIZE = 48;
const RING = 3;
const R = (SIZE - RING) / 2;
const C = 2 * Math.PI * R;

/**
 * L-shell scoop: chrome reveal can briefly fight a smooth tween. Start smooth,
 * then re-assert top after settle so the first click always lands at 0.
 */
function scrollNodeToTop(target: Element | Window | null | undefined): void {
  if (target instanceof Element) {
    target.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => {
      if (target.scrollTop > 0) {
        target.scrollTop = 0;
      }
    }, CHROME_SETTLE_MS + 16);
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function readScrollProgress(target: Element | null): number {
  if (target instanceof Element) {
    const max = target.scrollHeight - target.clientHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, target.scrollTop / max));
  }
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

/** Circular “back to top” with a border ring that fills as the page scrolls. */
export function AzesScrollToTop({
  scrollTarget = null,
  threshold = 240,
  label = 'Back to top',
}: AzesScrollToTopProps) {
  const theme = useTheme();
  const triggerOpts = scrollTarget ? { target: scrollTarget } : {};
  const visible = useScrollTrigger({
    disableHysteresis: true,
    threshold,
    ...triggerOpts,
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = scrollTarget instanceof Element ? scrollTarget : null;
    const onScroll = () => {
      setProgress(readScrollProgress(node));
    };
    onScroll();
    if (node) {
      node.addEventListener('scroll', onScroll, { passive: true });
      return () => node.removeEventListener('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTarget]);

  const onClick = useCallback(() => {
    scrollNodeToTop(scrollTarget ?? window);
  }, [scrollTarget]);

  const dashOffset = C * (1 - progress);
  const radiusFull = theme.shape.radiusFull ?? 999;

  return (
    <Fade in={visible}>
      <Box
        sx={{
          position: 'fixed',
          insetBlockEnd: theme.spacing(3),
          insetInlineEnd: theme.spacing(3),
          zIndex: theme.zIndex.speedDial,
          pointerEvents: visible ? 'auto' : 'none',
          width: SIZE,
          height: SIZE,
        }}
      >
        <Box
          component="svg"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={`color-mix(in srgb, ${theme.vars.palette.primary.main} 28%, ${theme.vars.palette.background.paper})`}
            strokeWidth={RING}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={theme.vars.palette.primary.main}
            strokeWidth={RING}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            style={{
              transition: theme.transitions.create('stroke-dashoffset', {
                duration: theme.transitions.duration.shorter,
              }),
            }}
          />
        </Box>

        <IconButton
          type="button"
          color="primary"
          aria-label={label}
          onClick={onClick}
          sx={{
            position: 'absolute',
            inset: RING + 2,
            width: SIZE - (RING + 2) * 2,
            height: SIZE - (RING + 2) * 2,
            borderRadius: `${radiusFull}px`,
            color: theme.vars.palette.common.white,
            backgroundColor: theme.vars.palette.primary.main,
            boxShadow: theme.shadows[3],
            '&:hover': {
              backgroundColor: theme.vars.palette.primary.dark,
              color: theme.vars.palette.common.white,
            },
            '& .MuiSvgIcon-root': {
              color: theme.vars.palette.common.white,
            },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>
      </Box>
    </Fade>
  );
}
