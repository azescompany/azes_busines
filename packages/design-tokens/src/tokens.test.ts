/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/tokens.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Unit tests for token maps, theme parity, and CSS exports
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  componentPx,
  darkTheme,
  fontFamilyPresets,
  getTheme,
  layoutPx,
  lightTheme,
  primitives,
  semanticColorDark,
  semanticColorLight,
  themeToCss,
  themes,
  themesToCss,
  toCssVariables,
  tokens,
} from './index';
import type { TokenPrimitive, TokenRecord } from './types';

function isRecord(value: TokenPrimitive | TokenRecord): value is TokenRecord {
  return typeof value === 'object' && value !== null;
}

function collectKeys(input: TokenRecord, path = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(input)) {
    const next = path ? `${path}.${key}` : key;
    if (isRecord(value)) {
      keys.push(...collectKeys(value, next));
    } else {
      keys.push(next);
    }
  }

  return keys.sort();
}

describe('@azes/design-tokens', () => {
  it('exports primitives for documented categories', () => {
    expect(primitives.color.teal600).toMatch(/^#/);
    expect(primitives.typography.fontSize.md).toBe('1rem');
    expect(primitives.spacing[4]).toBe('1rem');
    expect(primitives.spacingPx[4]).toBe(16);
    expect(primitives.radius.md).toBeDefined();
    expect(primitives.shadow.md).toContain('rgba');
    expect(primitives.elevation.md).toBeTypeOf('number');
    expect(primitives.breakpoint.lg).toBeDefined();
    expect(primitives.zIndex.modal).toBeGreaterThan(primitives.zIndex.base);
    expect(primitives.motion.duration.normal).toBe('200ms');
    expect(primitives.size.controlMd).toBeDefined();
  });

  it('exports layout, component and font preset tokens', () => {
    expect(layoutPx.navVerticalWidth).toBeGreaterThan(layoutPx.navMiniWidth);
    expect(layoutPx.headerHeightDesktop).toBeGreaterThanOrEqual(layoutPx.headerHeightMobile);
    expect(layoutPx.contentMaxWidth).toBe(primitives.sizePx.containerXl);
    expect(componentPx.navItemHeight.compact).toBeGreaterThanOrEqual(24);
    expect(componentPx.controlHeight.comfortable).toBe(primitives.sizePx.controlMd);
    expect(fontFamilyPresets.inter).toContain('Inter Variable');
    expect(fontFamilyPresets.sourceSerif).toContain('Source Serif 4 Variable');
    expect(fontFamilyPresets.nunito).toContain('Nunito Variable');
    expect(fontFamilyPresets.ibmPlexSans).toContain('IBM Plex Sans Variable');
    expect(fontFamilyPresets.fraunces).toContain('Fraunces Variable');
    expect(Object.keys(fontFamilyPresets)).toEqual([
      'inter',
      'sourceSerif',
      'nunito',
      'ibmPlexSans',
      'fraunces',
    ]);
    expect(primitives.layoutPx).toBe(layoutPx);
  });

  it('keeps light and dark semantic color structures aligned', () => {
    expect(collectKeys(semanticColorLight)).toEqual(collectKeys(semanticColorDark));
    expect(collectKeys(lightTheme.color)).toEqual(collectKeys(darkTheme.color));
  });

  it('registers light and dark themes with matching non-color foundations', () => {
    expect(Object.keys(themes)).toEqual(['light', 'dark']);
    expect(getTheme('light')).toBe(lightTheme);
    expect(getTheme('dark')).toBe(darkTheme);
    expect(lightTheme.spacing).toEqual(darkTheme.spacing);
    expect(lightTheme.typography).toEqual(darkTheme.typography);
    expect(tokens.defaultThemeName).toBe('light');
  });

  it('maps themes to CSS custom properties with azes prefix', () => {
    const vars = toCssVariables(lightTheme);
    expect(vars['--azes-color-action-primary']).toBe(lightTheme.color.action.primary);
    expect(vars['--azes-spacing-4']).toBe(lightTheme.spacing[4]);
    expect(vars['--azes-typography-fontSize-md']).toBe(lightTheme.typography.fontSize.md);

    const css = themeToCss(lightTheme);
    expect(css).toContain(':root[data-azes-theme="light"]');
    expect(css).toContain('--azes-color-background-canvas:');

    const both = themesToCss(themes);
    expect(both).toContain('data-azes-theme="dark"');
    expect(both).toContain('--azes-color-action-primary:');
  });

  it('does not depend on React or React Native', () => {
    const packageJsonPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
    };

    expect(deps.react).toBeUndefined();
    expect(deps['react-dom']).toBeUndefined();
    expect(deps['react-native']).toBeUndefined();
    expect(deps.next).toBeUndefined();
    expect(deps.expo).toBeUndefined();
  });
});
