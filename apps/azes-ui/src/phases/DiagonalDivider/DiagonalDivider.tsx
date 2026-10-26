/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/DiagonalDivider/DiagonalDivider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Clean section tilt wedge — no glow/blend seam artifacts
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox } from '@azes/ui-web';

import { DIAGONAL_H_CLAMP, dividerPolygonPoints, type DiagonalDirection } from '../diagonal.js';

export type DiagonalDividerProps = {
  fill: string;
  direction?: DiagonalDirection;
  edge?: 'top' | 'bottom';
  /** Defaults to fluid `--azes-diagonal-h` / clamp. */
  height?: number | string;
};

/**
 * Place inside a `position: relative` section. Prefer padding ≥ height on that edge.
 * Never cast box-shadow / filter — they paint a rectangle under the slant.
 * No blend/glow overlays (those read as pink “cheap” seams on photo→paper cuts).
 */
export function DiagonalDivider({
  fill,
  direction = 'ltr',
  edge = 'bottom',
  height = DIAGONAL_H_CLAMP,
}: DiagonalDividerProps) {
  const points = dividerPolygonPoints(edge, direction);
  const h = typeof height === 'number' ? `${height}px` : height;

  return (
    <MuiBox
      aria-hidden
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        // Overlap both sides slightly to kill subpixel hairlines.
        top: edge === 'top' ? '-2px' : 'auto',
        bottom: edge === 'bottom' ? '-2px' : 'auto',
        height: h,
        zIndex: 3,
        lineHeight: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        boxShadow: 'none',
        filter: 'none',
      }}
    >
      <MuiBox
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{ display: 'block', width: '100%', height: '100%' }}
      >
        <polygon points={points} fill={fill} />
      </MuiBox>
    </MuiBox>
  );
}
