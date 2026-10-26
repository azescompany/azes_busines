/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/css/variables.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Map theme tokens to CSS custom properties for web/Next.js
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TokenPrimitive, TokenRecord } from '../types';
import type { Theme } from '../themes/index';

const CSS_PREFIX = 'azes';

function isTokenRecord(value: TokenPrimitive | TokenRecord): value is TokenRecord {
  return typeof value === 'object' && value !== null;
}

function flattenTokens(
  input: TokenRecord,
  path: readonly string[] = [],
): Array<{ name: string; value: string }> {
  const entries: Array<{ name: string; value: string }> = [];

  for (const [key, value] of Object.entries(input)) {
    const nextPath = [...path, key];

    if (isTokenRecord(value)) {
      entries.push(...flattenTokens(value, nextPath));
      continue;
    }

    entries.push({
      name: `--${CSS_PREFIX}-${nextPath.join('-')}`,
      value: String(value),
    });
  }

  return entries;
}

/** Theme slices that become CSS variables (exclude native-only px/elevation maps). */
function themeToCssSource(theme: Theme): TokenRecord {
  return {
    color: theme.color,
    typography: theme.typography,
    spacing: theme.spacing,
    radius: theme.radius,
    shadow: theme.shadow,
    breakpoint: theme.breakpoint,
    zIndex: theme.zIndex,
    motion: {
      duration: theme.motion.duration,
      easing: theme.motion.easing,
    },
    size: theme.size,
  };
}

export function toCssVariableEntries(theme: Theme): ReadonlyArray<{ name: string; value: string }> {
  return flattenTokens(themeToCssSource(theme));
}

export function toCssVariables(theme: Theme): Readonly<Record<string, string>> {
  return Object.fromEntries(toCssVariableEntries(theme).map(({ name, value }) => [name, value]));
}

/**
 * Returns a CSS stylesheet fragment for a theme.
 * Example selector: `:root[data-azes-theme="light"]` or `.azes-theme-light`.
 */
export function themeToCss(
  theme: Theme,
  selector = `:root[data-azes-theme="${theme.name}"]`,
): string {
  const declarations = toCssVariableEntries(theme)
    .map(({ name, value }) => `  ${name}: ${value};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}\n`;
}

export function themesToCss(
  themeMap: Readonly<Record<string, Theme>>,
  selectorFor: (theme: Theme) => string = (theme) => `:root[data-azes-theme="${theme.name}"]`,
): string {
  return Object.values(themeMap)
    .map((theme) => themeToCss(theme, selectorFor(theme)))
    .join('\n');
}
