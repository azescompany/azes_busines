/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/motion.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Motion and animation duration foundation tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const duration = {
  instant: '0ms',
  fast: '120ms',
  normal: '200ms',
  slow: '320ms',
} as const;

export const durationMs = {
  instant: 0,
  fast: 120,
  normal: 200,
  slow: 320,
} as const;

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

export const motion = {
  duration,
  durationMs,
  easing,
} as const;
