/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/color-system.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: OKLCH brand/surface contrast matrix, fuzz and palette snapshots
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { brandSeedDarkPrimary, brandSeedOrder, brandSeeds, brandSeedSecondary } from './brand';
import { contrastRatio, deltaE, hexToOklch, hueDelta, isHexColor, oklchToHex } from './color-utils';
import { createAzesTheme } from './createAzesTheme';
import { MIN_DELTA_E, MIN_HUE_DELTA, deriveSecondaryFromPrimary } from './harmony';
import { AZES_CONTRAST_THRESHOLD, isPrimaryContrastSafe } from './palette';
import { clearSurfaceScaleCache, createSurfaceScale } from './surfaces';

function paletteSnapshot(primary: string) {
  const theme = createAzesTheme({ primary });
  const pick = (scheme: 'light' | 'dark') => {
    const p = theme.colorSchemes[scheme]?.palette;
    if (!p) throw new Error(`missing ${scheme}`);
    return {
      primary: p.primary.main,
      secondary: p.secondary.main,
      canvas: p.background.default,
      paper: p.background.paper,
      muted: p.background.muted,
      surface1: p.surface.level1,
      surface2: p.surface.level2,
      surface3: p.surface.level3,
      textPrimary: p.text.primary,
      textSecondary: p.text.secondary,
      link: p.text.link,
      focus: p.border.focus,
      success: p.success.main,
      warning: p.warning.main,
      error: p.error.main,
      info: p.info.main,
    };
  };
  return { light: pick('light'), dark: pick('dark') };
}

describe('color system — seeds', () => {
  it('keeps curated primary/secondary pairs separated and contrast-safe', () => {
    for (const name of brandSeedOrder) {
      for (const scheme of ['light', 'dark'] as const) {
        const primary = scheme === 'light' ? brandSeeds[name] : brandSeedDarkPrimary[name];
        const secondary = brandSeedSecondary[name][scheme];
        expect(
          hueDelta(hexToOklch(primary).h, hexToOklch(secondary).h),
          `${name} ${scheme} hue`,
        ).toBeGreaterThanOrEqual(MIN_HUE_DELTA);
        expect(deltaE(primary, secondary), `${name} ${scheme} ΔE`).toBeGreaterThanOrEqual(
          MIN_DELTA_E,
        );

        const theme = createAzesTheme({ primary: name });
        const palette = theme.colorSchemes[scheme]?.palette;
        if (!palette) throw new Error('palette missing');

        expect(
          contrastRatio(palette.primary.main, palette.primary.contrastText),
          `${name} ${scheme} primary contrastText`,
        ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);
        expect(
          contrastRatio(palette.secondary.main, palette.secondary.contrastText),
          `${name} ${scheme} secondary contrastText`,
        ).toBeGreaterThanOrEqual(AZES_CONTRAST_THRESHOLD);
        expect(
          contrastRatio(palette.primary.main, palette.background.paper),
          `${name} ${scheme} primary/paper`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(palette.text.link, palette.background.paper),
          `${name} ${scheme} link/paper`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(palette.border.focus, palette.background.paper),
          `${name} ${scheme} focus/paper`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(palette.text.primary, palette.background.paper),
          `${name} ${scheme} text/paper`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('tints dark surfaces toward primary hue with low chroma', () => {
    clearSurfaceScaleCache();
    for (const name of brandSeedOrder) {
      const primary = brandSeedDarkPrimary[name];
      const surfaces = createSurfaceScale({ primaryHex: primary, mode: 'dark' });
      const primaryH = hexToOklch(primary).h;
      for (const key of ['canvas', 'paper'] as const) {
        const o = hexToOklch(surfaces[key]);
        expect(hueDelta(o.h, primaryH), `${name} dark ${key} hue`).toBeLessThanOrEqual(8);
        expect(o.c, `${name} dark ${key} chroma`).toBeGreaterThanOrEqual(0.01);
        expect(o.c, `${name} dark ${key} chroma`).toBeLessThanOrEqual(0.03);
        expect(isHexColor(surfaces[key])).toBe(true);
      }
    }
  });

  it('snapshots full palettes for all 12 seeds', () => {
    const snapshots: Record<string, ReturnType<typeof paletteSnapshot>> = {};
    for (const name of brandSeedOrder) {
      snapshots[name] = paletteSnapshot(name);
    }
    expect(snapshots).toMatchSnapshot();
  });
});

describe('color system — custom hex', () => {
  it('accepted custom hexes pass full contrast rules; rejects keep isPrimaryContrastSafe false', () => {
    let accepted = 0;
    let rejected = 0;
    // Deterministic pseudo-random hex stream.
    let seed = 0x1234abcd;
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed;
    };

    for (let i = 0; i < 200; i += 1) {
      const n = next();
      const hex = `#${(n & 0xffffff).toString(16).padStart(6, '0')}`;
      const ok = isPrimaryContrastSafe(hex);
      if (ok) {
        accepted += 1;
        const theme = createAzesTheme({ primary: hex });
        for (const scheme of ['light', 'dark'] as const) {
          const p = theme.colorSchemes[scheme]?.palette;
          if (!p) throw new Error('missing');
          expect(contrastRatio(p.primary.main, p.primary.contrastText)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(p.primary.main, p.background.paper)).toBeGreaterThanOrEqual(3);
          expect(contrastRatio(p.secondary.main, p.secondary.contrastText)).toBeGreaterThanOrEqual(
            4.5,
          );
          const sec = deriveSecondaryFromPrimary(p.primary.main, scheme);
          expect(hueDelta(hexToOklch(p.primary.main).h, hexToOklch(sec).h)).toBeGreaterThanOrEqual(
            MIN_HUE_DELTA,
          );
        }
      } else {
        rejected += 1;
      }
    }

    expect(accepted + rejected).toBe(200);
    expect(rejected).toBeGreaterThan(0);
  });

  it('round-trips OKLCH within gamut for seed primaries', () => {
    for (const name of brandSeedOrder) {
      const hex = brandSeeds[name];
      const again = oklchToHex(hexToOklch(hex));
      expect(deltaE(hex, again)).toBeLessThan(0.02);
    }
  });
});
