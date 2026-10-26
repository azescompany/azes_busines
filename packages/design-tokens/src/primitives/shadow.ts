/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/shadow.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shadow / elevation foundation tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** CSS box-shadow strings for web. Native maps elevation via elevation levels. */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(15, 28, 44, 0.08)',
  md: '0 4px 12px rgba(15, 28, 44, 0.12)',
  lg: '0 12px 32px rgba(15, 28, 44, 0.16)',
  focus: '0 0 0 3px rgba(31, 148, 124, 0.35)',
} as const;

/** Numeric elevation levels for React Native (Android elevation / iOS shadowRadius hint). */
export const elevation = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 12,
} as const;
