/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/themes/dark.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Dark theme foundation composed from semantic tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '../primitives/index';
import { semanticColorDark } from '../semantic/color';

export const darkTheme = {
  name: 'dark' as const,
  color: semanticColorDark,
  typography: primitives.typography,
  spacing: primitives.spacing,
  spacingPx: primitives.spacingPx,
  radius: primitives.radius,
  radiusPx: primitives.radiusPx,
  shadow: primitives.shadow,
  elevation: primitives.elevation,
  breakpoint: primitives.breakpoint,
  breakpointPx: primitives.breakpointPx,
  zIndex: primitives.zIndex,
  motion: primitives.motion,
  size: primitives.size,
  sizePx: primitives.sizePx,
} as const;

export type DarkTheme = typeof darkTheme;
