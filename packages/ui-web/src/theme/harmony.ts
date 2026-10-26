/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/harmony.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-09
 * ║ Purpose: Derive brand-harmonized colors from a primary seed (OKLCH)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { brandSeedSecondary, seedNameForHex } from './brand';
import {
  bestContrastText,
  contrastRatio,
  deltaE,
  hexToOklch,
  hueDelta,
  oklchToHex,
  type Oklch,
} from './color-utils';

export type ColorSchemeName = 'light' | 'dark';

export { hexToHsl, hslToHex } from './color-utils';

const MIN_HUE_DELTA = 120;
const MIN_DELTA_E = 0.15;

/** Avoid muddy yellow-green secondaries (≈70–130°). */
function sanitizeSecondaryHue(primaryHue: number, candidateHue: number): number {
  let h = ((candidateHue % 360) + 360) % 360;
  if (h >= 70 && h <= 130) {
    // Push toward warm gold/orange or cool cyan depending on primary side.
    h = primaryHue < 180 ? 48 : 200;
  }
  return h;
}

/** Pick a complementary-side hue that stays ≥120° from primary after muddy-zone sanitizing. */
function complementaryHue(primaryHue: number): number {
  const offsets = [180, 165, 150, 195, 210, 140];
  for (const offset of offsets) {
    const h = sanitizeSecondaryHue(primaryHue, primaryHue + offset);
    if (hueDelta(primaryHue, h) >= MIN_HUE_DELTA) {
      return h;
    }
  }
  return (primaryHue + 180) % 360;
}

function ensurePairSeparation(primary: string, secondary: string, scheme: ColorSchemeName): string {
  const p = hexToOklch(primary);
  const targetL =
    scheme === 'light' ? clamp(p.l + 0.02, 0.5, 0.75) : clamp(Math.max(p.l, 0.7), 0.7, 0.86);
  const targetH = complementaryHue(p.h);
  const targetC = clamp(Math.max(p.c * 0.95, 0.1), 0.1, 0.2);

  let hex = oklchToHex({ l: targetL, c: targetC, h: targetH });
  let guard = 0;
  while (
    (hueDelta(p.h, hexToOklch(hex).h) < MIN_HUE_DELTA ||
      deltaE(primary, hex) < MIN_DELTA_E ||
      hexToOklch(hex).c < 0.05) &&
    guard < 10
  ) {
    hex = oklchToHex({
      l: targetL,
      c: Math.min(targetC + 0.015 * (guard + 1), 0.22),
      h: complementaryHue(p.h + guard * 8),
    });
    guard += 1;
  }

  // Ignore the incoming `secondary` seed when separation fails — rebuild from primary.
  void secondary;
  return hex;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Vivid split-complementary secondary from primary (OKLCH).
 * Uses curated pairs when `primary` matches a brand seed hex.
 */
export function deriveSecondaryFromPrimary(primary: string, scheme: ColorSchemeName): string {
  const seed = seedNameForHex(primary);
  if (seed) {
    return brandSeedSecondary[seed][scheme];
  }

  const p = hexToOklch(primary);
  const secondaryOklch: Oklch = {
    l: scheme === 'light' ? clamp(p.l + 0.02, 0.52, 0.72) : clamp(Math.max(p.l, 0.7), 0.7, 0.84),
    c: clamp(Math.max(p.c * 0.95, 0.1), 0.1, 0.2),
    h: complementaryHue(p.h),
  };
  return ensurePairSeparation(primary, oklchToHex(secondaryOklch), scheme);
}

/** Focus ring accent: slightly brighter and more saturated than primary. */
export function deriveFocusFromPrimary(primary: string, scheme: ColorSchemeName): string {
  const p = hexToOklch(primary);
  const focus = oklchToHex({
    l:
      scheme === 'light'
        ? clamp(p.l + 0.08, 0.45, 0.72)
        : clamp(Math.max(p.l, 0.55) + 0.05, 0.55, 0.85),
    c: clamp(p.c * 1.12, 0.08, 0.22),
    h: p.h,
  });
  return focus;
}

/**
 * Link text: same hue as primary, lightness tuned for ≥4.5:1 on a typical paper.
 * Caller should pass paper when available; falls back to scheme defaults.
 */
export function deriveLinkFromPrimary(
  primary: string,
  scheme: ColorSchemeName,
  paperHex?: string,
): string {
  const p = hexToOklch(primary);
  const paper = paperHex ?? (scheme === 'light' ? '#f7fafb' : '#141820');
  let l = scheme === 'light' ? 0.42 : 0.78;
  let hex = oklchToHex({ l, c: clamp(p.c, 0.08, 0.18), h: p.h });

  for (let i = 0; i < 12 && contrastRatio(hex, paper) < 4.5; i += 1) {
    l = scheme === 'light' ? l - 0.04 : l + 0.04;
    hex = oklchToHex({ l: clamp(l, 0.2, 0.92), c: clamp(p.c, 0.08, 0.18), h: p.h });
  }

  if (contrastRatio(hex, paper) < 4.5) {
    // Last resort: darken/lighten toward black/white while keeping hue.
    hex = oklchToHex({
      l: scheme === 'light' ? 0.28 : 0.88,
      c: clamp(p.c * 0.8, 0.05, 0.16),
      h: p.h,
    });
  }

  return hex;
}

/** Ensure focus meets ≥3:1 against a background by nudging lightness. */
export function ensureFocusContrast(
  focus: string,
  background: string,
  scheme: ColorSchemeName,
): string {
  let hex = focus;
  const p = hexToOklch(focus);
  let l = p.l;
  for (let i = 0; i < 10 && contrastRatio(hex, background) < 3; i += 1) {
    l = scheme === 'light' ? l - 0.04 : l + 0.04;
    hex = oklchToHex({ l: clamp(l, 0.25, 0.9), c: p.c, h: p.h });
  }
  return hex;
}

export { bestContrastText, contrastRatio, deltaE, hueDelta, MIN_DELTA_E, MIN_HUE_DELTA };
