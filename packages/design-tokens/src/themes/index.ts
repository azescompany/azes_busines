/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/themes/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Theme registry and lookup helpers
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ThemeName } from '../types';
import { darkTheme } from './dark';
import { lightTheme } from './light';

export { darkTheme, lightTheme };

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type Theme = (typeof themes)[ThemeName];

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export const defaultThemeName: ThemeName = 'light';
