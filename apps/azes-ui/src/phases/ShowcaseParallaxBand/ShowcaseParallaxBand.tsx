/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/ShowcaseParallaxBand/ShowcaseParallaxBand.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Caspian photo band — clip-path safe (no transform shadow leak)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, useMediaQuery, useTheme, type SxProps, type Theme } from '@azes/ui-web';
import type { ReactNode } from 'react';

import { bandClipPath, DIAGONAL_H_CLAMP, type DiagonalEdge } from '../diagonal.js';

export type ShowcaseParallaxBandProps = {
  imageUrl: string;
  children: ReactNode;
  minHeight?: number;
  scrollExtra?: number;
  diagonalHeight?: number | string;
  diagonalEdge?: DiagonalEdge;
  overlay?: string;
  sx?: SxProps<Theme>;
  contentAlign?: 'center' | 'start';
};

/**
 * Photo is a plain absolute layer (no CSS transform / will-change / filter).
 * Transforms on a clipped child paint a rectangular shadow under the diagonal.
 * Oversize the background via background-size instead of scale().
 */
export function ShowcaseParallaxBand({
  imageUrl,
  children,
  minHeight = 420,
  scrollExtra = 80,
  diagonalHeight = DIAGONAL_H_CLAMP,
  diagonalEdge = 'both',
  overlay,
  sx,
  contentAlign = 'center',
}: ShowcaseParallaxBandProps) {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const wash =
    overlay ??
    [
      `radial-gradient(ellipse 85% 55% at 50% 18%, color-mix(in srgb, ${theme.vars.palette.primary.main} 28%, transparent), transparent 70%)`,
      `linear-gradient(180deg, color-mix(in srgb, ${theme.vars.palette.common.black} 22%, transparent) 0%, color-mix(in srgb, ${theme.vars.palette.primary.dark} 52%, ${theme.vars.palette.common.black}) 100%)`,
    ].join(', ');

  const h = typeof diagonalHeight === 'number' ? `${diagonalHeight}px` : diagonalHeight;
  const trackPad = reduceMotion ? 0 : scrollExtra;
  const clipPath = bandClipPath(diagonalEdge, h);
  const bandMin = minHeight + trackPad;
  const padTop = diagonalEdge === 'bottom' ? 0 : h;
  const padBottom = h;

  return (
    <MuiBox
      sx={[
        {
          '--azes-diagonal-h': h,
          position: 'relative',
          isolation: 'isolate',
          clipPath,
          WebkitClipPath: clipPath,
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: Math.min(bandMin, 340), md: bandMin },
          color: theme.vars.palette.common.white,
          boxShadow: 'none',
          filter: 'none',
          textShadow: 'none',
          mb: '-2px',
          overflow: 'hidden',
          // Kill any theme/inherited rectangular paint under the slant.
          '&::before, &::after': { boxShadow: 'none', filter: 'none' },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <MuiBox
        aria-hidden
        component="img"
        src={imageUrl}
        alt=""
        decoding="async"
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          // No CSS transform — transforms under clip-path paint a rectangular shadow.
          pointerEvents: 'none',
          boxShadow: 'none',
          filter: 'none',
          userSelect: 'none',
        }}
      />
      <MuiBox
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: wash,
          boxShadow: 'none',
          filter: 'none',
        }}
      />
      <MuiBox
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: contentAlign === 'start' ? 'stretch' : 'center',
          justifyContent: 'center',
          width: '100%',
          pt: padTop === 0 ? { xs: 3, md: 4 } : `calc(${padTop} + ${theme.spacing(3)})`,
          pb: `calc(${padBottom} + ${theme.spacing(4)})`,
          px: { xs: 2, md: 3 },
          boxShadow: 'none',
          filter: 'none',
        }}
      >
        {children}
      </MuiBox>
    </MuiBox>
  );
}
