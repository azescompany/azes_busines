/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/lib/typography.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Map design-token typography to React Native text styles
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { TextStyle } from 'react-native';

export type TextSize = keyof typeof primitives.typography.fontSize;
export type TextWeight = keyof typeof primitives.typography.fontWeight;

const fontWeightMap = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const satisfies Record<TextWeight, NonNullable<TextStyle['fontWeight']>>;

/** Convert rem token strings (web) into numeric RN font sizes. */
export function remToPx(remValue: string): number {
  const parsed = Number.parseFloat(remValue);
  if (Number.isNaN(parsed)) {
    return 16;
  }

  return parsed * 16;
}

export function fontSizePx(size: TextSize): number {
  return remToPx(primitives.typography.fontSize[size]);
}

export function fontWeightValue(weight: TextWeight): NonNullable<TextStyle['fontWeight']> {
  return fontWeightMap[weight];
}
