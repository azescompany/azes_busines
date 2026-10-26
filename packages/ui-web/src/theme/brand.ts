/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/brand.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-15
 * ║ Purpose: Brand color seeds, curated secondaries and storage keys
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { oklchToHex, type Oklch } from './color-utils';
import {
  azesPrefsKey,
  patchAzesUiSync,
  readAzesUiSync,
  readCrossPortPref,
  writeCrossPortPref,
} from './crossPortStorage';

export { azesPrefsKey, configureAzesPrefsScope, getAzesPrefsScope } from './crossPortStorage';

/** Build a gamut-safe hex from OKLCH (chroma may be reduced). */
function seed(oklch: Oklch): string {
  return oklchToHex(oklch);
}

/**
 * Twelve curated brand primaries (light scheme).
 * Target: L≈0.55–0.62, high chroma, premium SaaS saturation.
 */
export const brandSeeds = {
  teal: seed({ l: 0.58, c: 0.125, h: 188 }),
  navy: seed({ l: 0.52, c: 0.11, h: 255 }),
  blue: seed({ l: 0.58, c: 0.17, h: 255 }),
  indigo: seed({ l: 0.55, c: 0.175, h: 275 }),
  violet: seed({ l: 0.56, c: 0.185, h: 295 }),
  green: seed({ l: 0.58, c: 0.145, h: 150 }),
  emerald: seed({ l: 0.6, c: 0.14, h: 168 }),
  amber: seed({ l: 0.62, c: 0.155, h: 75 }),
  orange: seed({ l: 0.6, c: 0.175, h: 45 }),
  red: seed({ l: 0.58, c: 0.19, h: 25 }),
  rose: seed({ l: 0.6, c: 0.18, h: 8 }),
  slate: seed({ l: 0.52, c: 0.045, h: 240 }),
} as const;

/**
 * Dark-scheme primaries: same hue, L≈0.70–0.78, chroma preserved where gamut allows.
 */
export const brandSeedDarkPrimary = {
  teal: seed({ l: 0.74, c: 0.12, h: 188 }),
  navy: seed({ l: 0.72, c: 0.1, h: 255 }),
  blue: seed({ l: 0.74, c: 0.145, h: 255 }),
  indigo: seed({ l: 0.72, c: 0.15, h: 275 }),
  violet: seed({ l: 0.74, c: 0.155, h: 295 }),
  green: seed({ l: 0.74, c: 0.13, h: 150 }),
  emerald: seed({ l: 0.76, c: 0.125, h: 168 }),
  amber: seed({ l: 0.8, c: 0.14, h: 75 }),
  orange: seed({ l: 0.76, c: 0.155, h: 45 }),
  red: seed({ l: 0.72, c: 0.165, h: 25 }),
  rose: seed({ l: 0.74, c: 0.155, h: 8 }),
  slate: seed({ l: 0.72, c: 0.04, h: 240 }),
} as const;

/**
 * Curated split-complementary secondaries (equal perceptual weight to primary).
 * Pairs: teal→coral, navy→amber, blue→orange, indigo→gold, violet→lime-gold,
 * green→magenta, emerald→rose, amber→indigo, orange→teal, red→cyan, rose→emerald, slate→amber.
 */
export const brandSeedSecondary = {
  teal: {
    light: seed({ l: 0.62, c: 0.165, h: 35 }),
    dark: seed({ l: 0.76, c: 0.14, h: 35 }),
  },
  navy: {
    light: seed({ l: 0.7, c: 0.145, h: 75 }),
    dark: seed({ l: 0.8, c: 0.13, h: 75 }),
  },
  blue: {
    light: seed({ l: 0.66, c: 0.17, h: 48 }),
    dark: seed({ l: 0.78, c: 0.145, h: 48 }),
  },
  indigo: {
    light: seed({ l: 0.72, c: 0.15, h: 85 }),
    dark: seed({ l: 0.82, c: 0.13, h: 85 }),
  },
  violet: {
    light: seed({ l: 0.74, c: 0.155, h: 110 }),
    dark: seed({ l: 0.84, c: 0.135, h: 110 }),
  },
  green: {
    light: seed({ l: 0.58, c: 0.18, h: 340 }),
    dark: seed({ l: 0.74, c: 0.15, h: 340 }),
  },
  emerald: {
    light: seed({ l: 0.6, c: 0.17, h: 12 }),
    dark: seed({ l: 0.76, c: 0.145, h: 12 }),
  },
  amber: {
    light: seed({ l: 0.52, c: 0.16, h: 275 }),
    dark: seed({ l: 0.72, c: 0.14, h: 275 }),
  },
  orange: {
    light: seed({ l: 0.56, c: 0.13, h: 200 }),
    dark: seed({ l: 0.74, c: 0.12, h: 200 }),
  },
  red: {
    light: seed({ l: 0.58, c: 0.12, h: 205 }),
    dark: seed({ l: 0.74, c: 0.11, h: 205 }),
  },
  rose: {
    light: seed({ l: 0.6, c: 0.14, h: 165 }),
    dark: seed({ l: 0.76, c: 0.125, h: 165 }),
  },
  slate: {
    light: seed({ l: 0.68, c: 0.15, h: 55 }),
    dark: seed({ l: 0.8, c: 0.13, h: 55 }),
  },
} as const;

/** Default brand primary (settings + theme boot). */
export const DEFAULT_PRIMARY = brandSeeds.red;

/** Fallback when a secondary input is invalid. */
export const DEFAULT_SECONDARY = brandSeedSecondary.navy.light;

export const AZES_PRIMARY_COOKIE = 'azes-primary';
export const AZES_PRIMARY_STORAGE_KEY = 'azes-primary';
export const AZES_MODE_STORAGE_KEY = 'azes-mode';
export const AZES_COLOR_SCHEME_STORAGE_KEY = 'azes-color-scheme';
export const AZES_COLOR_SCHEME_ATTRIBUTE = 'data-azes-color-scheme';

export type BrandSeedName = keyof typeof brandSeeds;

/** Ordered seed names for selects and docs (`red` first = default swatch). */
export const brandSeedOrder = [
  'red',
  'rose',
  'orange',
  'amber',
  'teal',
  'emerald',
  'green',
  'blue',
  'navy',
  'indigo',
  'violet',
  'slate',
] as const satisfies readonly BrandSeedName[];

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function seedNameForHex(hex: string): BrandSeedName | null {
  const normalized = hex.toLowerCase();
  const names = Object.keys(brandSeeds) as BrandSeedName[];
  const fromLight = names.find((name) => brandSeeds[name].toLowerCase() === normalized);
  if (fromLight) return fromLight;
  return names.find((name) => brandSeedDarkPrimary[name].toLowerCase() === normalized) ?? null;
}

export function resolveBrandColor(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  if (value in brandSeeds) {
    return brandSeeds[value as BrandSeedName];
  }

  if (HEX_COLOR.test(value)) {
    return value;
  }

  return fallback;
}

export function resolveBrandPrimary(value: string | null | undefined): string {
  return resolveBrandColor(value, DEFAULT_PRIMARY);
}

export function resolveBrandSecondary(value: string | null | undefined): string {
  return resolveBrandColor(value, DEFAULT_SECONDARY);
}

export function persistPrimary(value: string): string {
  const resolved = resolveBrandPrimary(value);

  if (typeof window === 'undefined') {
    return resolved;
  }

  // Compact `azes-ui` cookie is the cross-port source of truth; mirrors azes-primary.
  patchAzesUiSync({ primary: resolved });
  const primaryKey = azesPrefsKey(AZES_PRIMARY_STORAGE_KEY);
  const primaryCookie = azesPrefsKey(AZES_PRIMARY_COOKIE);
  if (primaryCookie !== primaryKey) {
    writeCrossPortPref(primaryCookie, resolved);
  }
  return resolved;
}

export function readStoredPrimary(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const fromSync = readAzesUiSync().primary;
  if (fromSync) return fromSync;
  return (
    readCrossPortPref(azesPrefsKey(AZES_PRIMARY_STORAGE_KEY)) ??
    readCrossPortPref(azesPrefsKey(AZES_PRIMARY_COOKIE))
  );
}

/** Active-scope mode storage key for MUI `InitColorSchemeScript` / ThemeProvider. */
export function getAzesModeStorageKey(): string {
  return azesPrefsKey(AZES_MODE_STORAGE_KEY);
}

/** Active-scope color-scheme storage key. */
export function getAzesColorSchemeStorageKey(): string {
  return azesPrefsKey(AZES_COLOR_SCHEME_STORAGE_KEY);
}

/** Active-scope primary cookie name (SSR FOUC). */
export function getAzesPrimaryCookieName(): string {
  return azesPrefsKey(AZES_PRIMARY_COOKIE);
}
