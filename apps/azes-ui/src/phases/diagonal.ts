/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/diagonal.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Shared Caspian diagonal clip math (CSS vars + polygons)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type DiagonalEdge = 'both' | 'bottom' | 'top';
export type DiagonalDirection = 'ltr' | 'rtl';

/** Desktop default; mobile uses clamp via CSS `--azes-diagonal-h`. */
export const DIAGONAL_H_DESKTOP = 56;
export const DIAGONAL_H_MOBILE = 40;

/** Fluid diagonal height token for sx / CSS. */
export const DIAGONAL_H_CLAMP = `clamp(${DIAGONAL_H_MOBILE}px, 4.5vw, ${DIAGONAL_H_DESKTOP}px)`;

/**
 * Clip-path polygon for a photo band.
 * `h` may be a px number or a CSS length (e.g. var(--azes-diagonal-h)).
 */
export function bandClipPath(edge: DiagonalEdge, h: string | number): string {
  const cut = typeof h === 'number' ? `${h}px` : h;
  if (edge === 'bottom') {
    return `polygon(0 0, 100% 0, 100% calc(100% - ${cut}), 0 100%)`;
  }
  if (edge === 'top') {
    return `polygon(0 ${cut}, 100% 0, 100% 100%, 0 100%)`;
  }
  return `polygon(0 ${cut}, 100% 0, 100% calc(100% - ${cut}), 0 100%)`;
}

/** SVG viewBox polygon points for DiagonalDivider wedges (0–100 space). */
export function dividerPolygonPoints(edge: 'top' | 'bottom', direction: DiagonalDirection): string {
  if (edge === 'top') {
    return direction === 'ltr' ? '0,0 100,0 0,100' : '0,0 100,0 100,100';
  }
  return direction === 'ltr' ? '0,0 100,100 0,100' : '0,100 100,0 100,100';
}
