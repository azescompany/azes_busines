/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/design-tokens/src/primitives/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Public primitive token barrel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { breakpoint, breakpointPx } from './breakpoint';
import { color } from './color';
import { componentPx, layoutPx } from './layout';
import { motion } from './motion';
import { radius, radiusPx } from './radius';
import { elevation, shadow } from './shadow';
import { size, sizePx } from './sizing';
import { spacing, spacingPx } from './spacing';
import { fontFamilyPresets, typography } from './typography';
import { zIndex } from './zIndex';

export type { ComponentPx, LayoutPx } from './layout';
export type { FontFamilyPresetId } from './typography';

export {
  breakpoint,
  breakpointPx,
  color,
  componentPx,
  elevation,
  fontFamilyPresets,
  layoutPx,
  motion,
  radius,
  radiusPx,
  shadow,
  size,
  sizePx,
  spacing,
  spacingPx,
  typography,
  zIndex,
};

export const primitives = {
  color,
  typography,
  spacing,
  spacingPx,
  radius,
  radiusPx,
  shadow,
  elevation,
  breakpoint,
  breakpointPx,
  zIndex,
  motion,
  size,
  sizePx,
  layoutPx,
  componentPx,
  fontFamilyPresets,
} as const;

export type Primitives = typeof primitives;
