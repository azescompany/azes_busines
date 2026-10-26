/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/loading/CaspianLogo/caspianLogoPaths.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: ViewBox / aspect for caspian-key-logo-global.svg
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Source: packages/assets/icons/general/caspian-key-logo-global.svg
 * Mark crop ≈ left key emblem; compact hides tagline (`[data-name="P"]`).
 */

export const CASPIAN_VIEWBOX = {
  /** Full wordmark + tagline */
  full: '0 0 682.5 141.5',
  /**
   * Same canvas as full — tagline hidden in CSS (`[data-name="P"]`).
   * Avoid a shorter crop that clips wordmark descenders in the header.
   */
  compact: '0 0 682.5 141.5',
  /** Key emblem only (left plate). */
  mark: '8 16 220 118',
} as const;

export const CASPIAN_ASPECT = {
  full: 682.5 / 141.5,
  compact: 682.5 / 141.5,
  mark: 220 / 118,
} as const;
