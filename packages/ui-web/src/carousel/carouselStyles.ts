/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/carouselStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven sx helpers for AzesCarousel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { SxProps, Theme } from '@mui/material/styles';

import type { AzesCarouselVariant } from './types';

export type CarouselStyleOptions = {
  variant: AzesCarouselVariant;
  aspectRatio: string;
  fit: 'cover' | 'contain';
  showArrows: boolean;
};

function tintedSurface(theme: Theme): string {
  const mix = theme.azes.carousel.surfaceMixPercent;
  return `color-mix(in srgb, ${theme.vars.palette.background.paper} ${mix}%, transparent)`;
}

export function getCarouselRootSx(theme: Theme, options: CarouselStyleOptions): SxProps<Theme> {
  const tokens = theme.azes.carousel;
  return {
    position: 'relative',
    width: '100%',
    borderRadius: theme.azesRadius.lg,
    overflow: 'hidden',
    border:
      options.variant === 'outlined' ? `1px solid ${theme.vars.palette.border.default}` : 'none',
    backgroundColor: theme.vars.palette.background.muted,
    outline: 'none',
    '&:focus-visible': {
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: theme.spacing(0.5),
    },
    '--azes-carousel-aspect': options.aspectRatio || tokens.aspectRatio,
    '--azes-carousel-fit': options.fit,
    '--azes-carousel-arrow': `${tokens.arrowSize}px`,
    '--azes-carousel-thumb': `${tokens.thumbSize}px`,
  };
}

export function getCarouselTrackSx(_theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    aspectRatio: 'var(--azes-carousel-aspect)',
    '@media (prefers-reduced-motion: reduce)': {
      scrollBehavior: 'auto',
    },
  };
}

export function getCarouselSlideSx(theme: Theme): SxProps<Theme> {
  return {
    position: 'relative',
    flex: '0 0 100%',
    width: '100%',
    height: '100%',
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
    backgroundColor: theme.vars.palette.background.muted,
    overflow: 'hidden',
  };
}

export function getCarouselImageSx(): SxProps<Theme> {
  return {
    width: '100%',
    height: '100%',
    objectFit: 'var(--azes-carousel-fit)' as 'cover',
    display: 'block',
    userSelect: 'none',
    WebkitUserDrag: 'none',
  };
}

export function getCarouselChromeOverlaySx(theme: Theme): SxProps<Theme> {
  return {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: theme.spacing(7),
    pointerEvents: 'none',
    background: `linear-gradient(to top, color-mix(in srgb, ${theme.vars.palette.common.black} 28%, transparent), transparent)`,
  };
}

export function getCarouselArrowSx(theme: Theme): SxProps<Theme> {
  const size = theme.azes.carousel.arrowSize;
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: size,
    height: size,
    minWidth: size,
    p: 0,
    borderRadius: theme.azesRadius.full,
    color: theme.vars.palette.text.primary,
    backgroundColor: tintedSurface(theme),
    border: `1px solid ${theme.vars.palette.border.default}`,
    backdropFilter: 'blur(8px)',
    opacity: 0,
    transition: theme.transitions.create(['opacity', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '&:hover': {
      backgroundColor: theme.vars.palette.background.paper,
    },
    '&.Mui-focusVisible, &:focus-visible': {
      opacity: 1,
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: 2,
    },
    '&.Mui-disabled': {
      opacity: 0.35,
    },
    '[data-azes-carousel-root]:hover &, [data-azes-carousel-root]:focus-within &': {
      opacity: 1,
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  };
}

export function getCarouselCounterSx(theme: Theme): SxProps<Theme> {
  return {
    position: 'absolute',
    zIndex: 2,
    insetInlineEnd: theme.spacing(1.5),
    bottom: theme.spacing(1.5),
    px: 1,
    py: 0.25,
    borderRadius: theme.azesRadius.full,
    typography: theme.azes.carousel.counterTypography,
    color: theme.vars.palette.text.primary,
    backgroundColor: tintedSurface(theme),
    border: `1px solid ${theme.vars.palette.border.default}`,
    backdropFilter: 'blur(8px)',
    pointerEvents: 'none',
  };
}

export function getCarouselFullscreenBtnSx(theme: Theme): SxProps<Theme> {
  const size = theme.azes.carousel.arrowSize;
  return {
    position: 'absolute',
    zIndex: 2,
    insetInlineEnd: theme.spacing(1.5),
    top: theme.spacing(1.5),
    width: size,
    height: size,
    minWidth: size,
    p: 0,
    borderRadius: theme.azesRadius.full,
    color: theme.vars.palette.text.primary,
    backgroundColor: tintedSurface(theme),
    border: `1px solid ${theme.vars.palette.border.default}`,
    backdropFilter: 'blur(8px)',
    opacity: 0,
    transition: theme.transitions.create(['opacity'], {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '&.Mui-focusVisible, &:focus-visible': {
      opacity: 1,
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: 2,
    },
    '[data-azes-carousel-root]:hover &, [data-azes-carousel-root]:focus-within &': {
      opacity: 1,
    },
  };
}

export function getCarouselThumbStripSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'flex',
    gap: theme.spacing(theme.azes.carousel.thumbGap),
    overflowX: 'auto',
    overflowY: 'hidden',
    px: theme.spacing(1),
    py: theme.spacing(1),
    scrollBehavior: 'smooth',
    scrollbarWidth: 'thin',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    '@media (prefers-reduced-motion: reduce)': {
      scrollBehavior: 'auto',
    },
  };
}

export function getCarouselThumbBtnSx(theme: Theme, active: boolean): SxProps<Theme> {
  const size = theme.azes.carousel.thumbSize;
  return {
    flex: '0 0 auto',
    width: size,
    height: size,
    p: 0,
    borderRadius: theme.azesRadius.md,
    overflow: 'hidden',
    opacity: active ? 1 : 0.55,
    border: active
      ? `2px solid ${theme.vars.palette.primary.main}`
      : `1px solid ${theme.vars.palette.border.default}`,
    backgroundColor: theme.vars.palette.background.muted,
    transition: theme.transitions.create(['opacity', 'border-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
    '&:hover': {
      opacity: 1,
    },
    '&.Mui-focusVisible, &:focus-visible': {
      outline: `2px solid ${theme.vars.palette.border.focus}`,
      outlineOffset: 2,
    },
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },
  };
}

export function getCarouselDotsSx(theme: Theme): SxProps<Theme> {
  return {
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    py: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
    },
  };
}

export function getCarouselDotSx(theme: Theme, active: boolean): SxProps<Theme> {
  return {
    width: theme.spacing(active ? 1.25 : 0.75),
    height: theme.spacing(0.75),
    borderRadius: theme.azesRadius.full,
    border: 'none',
    p: 0,
    minWidth: 0,
    backgroundColor: active
      ? theme.vars.palette.primary.main
      : `color-mix(in srgb, ${theme.vars.palette.text.primary} 35%, transparent)`,
    transition: theme.transitions.create(['width', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  };
}

export function getCarouselEmptySx(theme: Theme): SxProps<Theme> {
  return {
    aspectRatio: 'var(--azes-carousel-aspect)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
    color: theme.vars.palette.text.secondary,
    typography: 'body2',
  };
}

export function getCarouselLightboxPaperSx(theme: Theme): SxProps<Theme> {
  return {
    position: 'relative',
    width: '100%',
    maxWidth: theme.breakpoints.values.lg,
    mx: 'auto',
    outline: 'none',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  };
}
