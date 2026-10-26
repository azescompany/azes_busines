/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/lib/spacing.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Resolve design-token spacing keys to native pixel values
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';

export const spacingPx = primitives.spacingPx;
export type SpacingKey = keyof typeof spacingPx;

export function resolveSpacing(key: SpacingKey | undefined): number | undefined {
  if (key === undefined || !(key in spacingPx)) {
    return undefined;
  }

  return spacingPx[key];
}
