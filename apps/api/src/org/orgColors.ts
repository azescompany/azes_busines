/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/orgColors.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Default org color palette rotation (M5.0-lite)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Fixed brand-adjacent palette — UI maps swatches; no freeform hex from clients required. */
export const ORG_COLOR_PALETTE = [
  '#2563EB',
  '#16A34A',
  '#CA8A04',
  '#DC2626',
  '#9333EA',
  '#0891B2',
  '#EA580C',
  '#DB2777',
] as const;

const TRIAL_DAYS = 35;
const DAY_SEC = 60 * 60 * 24;

export function pickOrgColor(seed: number): string {
  const idx = Math.abs(seed) % ORG_COLOR_PALETTE.length;
  return ORG_COLOR_PALETTE[idx]!;
}

export function defaultTrialEndsAt(now: number): number {
  return now + TRIAL_DAYS * DAY_SEC;
}

export function isAllowedOrgColor(code: string): boolean {
  return (ORG_COLOR_PALETTE as readonly string[]).includes(code);
}
