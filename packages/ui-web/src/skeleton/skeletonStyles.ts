/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/skeletonStyles.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Token-driven sx + Caspian-wave keyframes for AzesSkeleton
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { keyframes, type SxProps, type Theme } from '@mui/material/styles';

export type AzesSkeletonShape =
  'text' | 'rect' | 'circle' | 'pill' | 'avatar' | 'button' | 'chip' | 'image';

export type AzesSkeletonRadius = 'sm' | 'md' | 'lg' | 'full';

export type AzesSkeletonMotion = 'wave' | 'pulse' | 'static';

const blockFadeIn = keyframes`
  from { opacity: 0.35; }
  to { opacity: 1; }
`;

const waveSlide = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
`;

const waveSlideRtl = keyframes`
  0% { transform: translateX(120%); }
  100% { transform: translateX(-120%); }
`;

const softPulse = keyframes`
  0%, 100% { opacity: 0.72; }
  50% { opacity: 1; }
`;

export function resolveSkeletonRadiusPx(theme: Theme, radius?: AzesSkeletonRadius): number {
  switch (radius) {
    case 'sm':
      return theme.shape.radiusSm;
    case 'lg':
      return theme.shape.radiusLg;
    case 'full':
      return theme.shape.radiusFull;
    case 'md':
    default:
      return theme.shape.radiusMd;
  }
}

export function defaultSkeletonSize(
  theme: Theme,
  shape: AzesSkeletonShape,
): { width: string | number; height: string | number; radius: AzesSkeletonRadius } {
  const sk = theme.azes.skeleton;
  switch (shape) {
    case 'circle':
    case 'avatar':
      return {
        width: theme.spacing(sk.avatarSpacing),
        height: theme.spacing(sk.avatarSpacing),
        radius: 'full',
      };
    case 'pill':
    case 'chip':
      return {
        width: theme.spacing(10),
        height: theme.spacing(sk.chipHeightSpacing),
        radius: 'full',
      };
    case 'button':
      return {
        width: theme.spacing(12),
        height: theme.spacing(sk.controlHeightSpacing),
        radius: 'md',
      };
    case 'image':
      return { width: '100%', height: theme.spacing(18), radius: 'md' };
    case 'rect':
      return { width: '100%', height: theme.spacing(sk.controlHeightSpacing), radius: 'md' };
    case 'text':
    default:
      return { width: '100%', height: theme.spacing(sk.textLineSpacing), radius: 'sm' };
  }
}

export function getSkeletonBlockSx(
  theme: Theme,
  options: {
    shape: AzesSkeletonShape;
    width?: number | string;
    height?: number | string;
    radius?: AzesSkeletonRadius;
    index?: number;
  },
): SxProps<Theme> {
  const sk = theme.azes.skeleton;
  const defaults = defaultSkeletonSize(theme, options.shape);
  const radiusPx = resolveSkeletonRadiusPx(theme, options.radius ?? defaults.radius);
  const index = options.index ?? 0;

  return {
    display: 'block',
    width: options.width ?? defaults.width,
    height: options.height ?? defaults.height,
    maxWidth: '100%',
    flexShrink: 0,
    borderRadius: `${radiusPx}px`,
    backgroundColor: `color-mix(in srgb, ${theme.vars.palette.text.primary} ${sk.baseMixPercent}%, ${theme.vars.palette.background.paper})`,
    ...theme.applyStyles('dark', {
      backgroundColor: `color-mix(in srgb, ${theme.vars.palette.common.white} ${sk.baseMixPercent}%, ${theme.vars.palette.background.paper})`,
    }),
    animation: `${blockFadeIn} ${sk.fadeInMs}ms ${sk.easing} both`,
    animationDelay: `calc(${sk.staggerMs}ms * ${index})`,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
    '@media (forced-colors: active)': {
      backgroundColor: 'GrayText',
      outline: '1px solid CanvasText',
      outlineOffset: -1,
    },
  };
}

export function getSkeletonGroupSx(theme: Theme, motion: AzesSkeletonMotion): SxProps<Theme> {
  const sk = theme.azes.skeleton;
  const wave = `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${theme.vars.palette.primary.main} ${sk.waveMixPercent}%, transparent) 45%, color-mix(in srgb, ${theme.vars.palette.primary.main} ${sk.waveMixPercent + 6}%, transparent) 55%, transparent 100%)`;

  const base: SxProps<Theme> = {
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    width: '100%',
    minWidth: 0,
  };

  if (motion === 'static') {
    return base;
  }

  if (motion === 'pulse') {
    return {
      ...base,
      animation: `${softPulse} ${sk.durationMs}ms ease-in-out infinite`,
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    };
  }

  // Approach A: single group-level ::after wave (GPU transform only).
  return {
    ...base,
    '&::after': {
      content: '""',
      position: 'absolute',
      insetBlock: 0,
      insetInlineStart: 0,
      width: `${sk.waveWidthPercent}%`,
      pointerEvents: 'none',
      zIndex: 1,
      backgroundImage: wave,
      animation: `${waveSlide} ${sk.durationMs}ms ${sk.easing} infinite`,
      '[dir="rtl"] &': {
        animationName: `${waveSlideRtl}`,
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      '&::after': {
        display: 'none',
      },
    },
    '@media (prefers-reduced-transparency: reduce), (forced-colors: active)': {
      '&::after': {
        display: 'none',
      },
    },
  };
}
