/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/tokens.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Aggregated design-token object (JS/RN consumable)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from './primitives/index';
import { semanticColorDark, semanticColorLight } from './semantic/color';
import { darkTheme, defaultThemeName, lightTheme, themes } from './themes/index';

export const tokens = {
  primitives,
  semantic: {
    color: {
      light: semanticColorLight,
      dark: semanticColorDark,
    },
  },
  themes,
  light: lightTheme,
  dark: darkTheme,
  defaultThemeName,
} as const;

export type DesignTokens = typeof tokens;
