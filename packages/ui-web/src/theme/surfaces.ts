/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/surfaces.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Primary-hue tinted surface scale for light and dark schemes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { contrastRatio, hexToOklch, mixHex, oklchToHex, type Oklch } from './color-utils';
import type { ColorSchemeName } from './harmony';

export type AzesSurfaceScale = {
  canvas: string;
  paper: string;
  muted: string;
  surface1: string;
  surface2: string;
  surface3: string;
  divider: string;
  borderDefault: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  actionHover: string;
  actionSelected: string;
  actionFocus: string;
  actionDisabled: string;
  actionDisabledBackground: string;
};

const cache = new Map<string, AzesSurfaceScale>();

/** Hue-aware chroma for tinted neutrals — keep yellow/green zones cleaner. */
function surfaceChroma(hue: number, mode: ColorSchemeName, base: number): number {
  const muddy = hue >= 70 && hue <= 140;
  const factor = muddy ? 0.55 : 1;
  if (mode === 'dark') {
    return Math.min(0.03, Math.max(0.012, base * factor));
  }
  return Math.min(0.012, Math.max(0.003, base * 0.35 * factor));
}

function tint(l: number, c: number, h: number): string {
  return oklchToHex({ l, c, h });
}

function ensureBorderContrast(candidate: Oklch, paper: string, minRatio: number): string {
  let { l } = candidate;
  const { c, h } = candidate;
  let chroma = c;
  let hex = oklchToHex({ l, c: chroma, h });
  for (let i = 0; i < 10 && contrastRatio(hex, paper) < minRatio; i += 1) {
    // Darken on light paper, lighten on dark paper.
    const paperL = hexToOklch(paper).l;
    l = paperL > 0.5 ? l - 0.03 : l + 0.03;
    chroma = Math.min(chroma + 0.002, 0.04);
    hex = oklchToHex({ l, c: chroma, h });
  }
  return hex;
}

function ensureTextContrast(candidate: Oklch, paper: string, minRatio: number): string {
  let { l } = candidate;
  const { c, h } = candidate;
  let hex = oklchToHex({ l, c, h });
  for (let i = 0; i < 12 && contrastRatio(hex, paper) < minRatio; i += 1) {
    const paperL = hexToOklch(paper).l;
    l = paperL > 0.5 ? l - 0.04 : l + 0.04;
    hex = oklchToHex({ l: Math.min(0.99, Math.max(0.05, l)), c, h });
  }
  return hex;
}

export function createSurfaceScale(input: {
  primaryHex: string;
  mode: ColorSchemeName;
}): AzesSurfaceScale {
  const key = `${input.mode}:${input.primaryHex.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const { h } = hexToOklch(input.primaryHex);
  const mode = input.mode;

  let scale: AzesSurfaceScale;

  if (mode === 'dark') {
    const c = surfaceChroma(h, 'dark', 0.022);
    const canvas = tint(0.16, c, h);
    const paper = tint(0.2, c * 1.05, h);
    const muted = tint(0.225, c, h);
    const surface1 = tint(0.225, c, h);
    const surface2 = tint(0.25, c * 1.05, h);
    const surface3 = tint(0.275, c * 1.1, h);
    const textPrimary = ensureTextContrast({ l: 0.96, c: c * 0.35, h }, paper, 4.5);
    const textSecondary = ensureTextContrast({ l: 0.72, c: c * 0.45, h }, paper, 4.5);
    const textMuted = ensureTextContrast({ l: 0.62, c: c * 0.35, h }, paper, 3);
    const borderDefault = ensureBorderContrast({ l: 0.32, c: c * 1.2, h }, paper, 1.3);
    const borderStrong = ensureBorderContrast({ l: 0.4, c: c * 1.35, h }, paper, 2);
    const divider = borderDefault;

    scale = {
      canvas,
      paper,
      muted,
      surface1,
      surface2,
      surface3,
      divider,
      borderDefault,
      borderStrong,
      textPrimary,
      textSecondary,
      textMuted,
      actionHover: mixHex(paper, input.primaryHex, 0.12),
      actionSelected: mixHex(paper, input.primaryHex, 0.16),
      actionFocus: mixHex(paper, input.primaryHex, 0.2),
      actionDisabled: mixHex(paper, textPrimary, 0.38),
      actionDisabledBackground: mixHex(paper, textPrimary, 0.12),
    };
  } else {
    const c = surfaceChroma(h, 'light', 0.02);
    const canvas = tint(0.98, c, h);
    const paper = tint(0.995, Math.max(0.003, c * 0.7), h);
    const muted = tint(0.96, c * 1.1, h);
    const surface1 = muted;
    const surface2 = tint(0.945, c * 1.15, h);
    const surface3 = tint(0.93, c * 1.2, h);
    const textPrimary = ensureTextContrast({ l: 0.22, c: c * 0.8, h }, paper, 4.5);
    const textSecondary = ensureTextContrast({ l: 0.42, c: c * 0.7, h }, paper, 4.5);
    const textMuted = ensureTextContrast({ l: 0.52, c: c * 0.55, h }, paper, 3);
    const borderDefault = ensureBorderContrast({ l: 0.88, c: c * 1.2, h }, paper, 1.3);
    const borderStrong = ensureBorderContrast({ l: 0.78, c: c * 1.4, h }, paper, 2);
    const divider = borderDefault;

    scale = {
      canvas,
      paper,
      muted,
      surface1,
      surface2,
      surface3,
      divider,
      borderDefault,
      borderStrong,
      textPrimary,
      textSecondary,
      textMuted,
      actionHover: mixHex(paper, input.primaryHex, 0.08),
      actionSelected: mixHex(paper, input.primaryHex, 0.12),
      actionFocus: mixHex(paper, input.primaryHex, 0.16),
      actionDisabled: mixHex(paper, textPrimary, 0.38),
      actionDisabledBackground: mixHex(paper, textPrimary, 0.08),
    };
  }

  cache.set(key, scale);
  return scale;
}

/** Test helper — clear memoization between cases. */
export function clearSurfaceScaleCache(): void {
  cache.clear();
}
