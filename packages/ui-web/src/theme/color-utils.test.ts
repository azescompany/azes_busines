/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/color-utils.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Unit tests for OKLCH utilities
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import {
  bestContrastText,
  contrastRatio,
  deltaE,
  hexToOklch,
  hueDelta,
  mixHex,
  oklchToHex,
} from './color-utils';

describe('color-utils', () => {
  it('converts known hex to OKLCH and back with low ΔE', () => {
    const hex = '#0e9384';
    const oklch = hexToOklch(hex);
    expect(oklch.l).toBeGreaterThan(0.4);
    expect(oklch.c).toBeGreaterThan(0.05);
    expect(deltaE(hex, oklchToHex(oklch))).toBeLessThan(0.02);
  });

  it('computes WCAG contrast and best contrast text', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThan(20);
    expect(bestContrastText('#084c45')).toBe('#ffffff');
    expect(bestContrastText('#f8fafc')).toBe('#000000');
    expect(contrastRatio(bestContrastText('#0e9384'), '#0e9384')).toBeGreaterThanOrEqual(4.5);
  });

  it('measures hue delta on the short arc', () => {
    expect(hueDelta(10, 350)).toBe(20);
    expect(hueDelta(0, 180)).toBe(180);
  });

  it('mixes hex toward an overlay', () => {
    const mixed = mixHex('#ffffff', '#000000', 0.5);
    expect(mixed).toMatch(/^#[0-9a-f]{6}$/);
    expect(mixed).not.toBe('#ffffff');
    expect(mixed).not.toBe('#000000');
  });

  it('clamps out-of-gamut OKLCH to a valid hex', () => {
    const hex = oklchToHex({ l: 0.6, c: 0.5, h: 140 });
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
  });
});
