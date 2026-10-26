/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/spacing.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-09-29
 * ║ Purpose: Map design-token spacing keys onto the 4px MUI spacing factor
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';

export type SpacingKey = keyof typeof primitives.spacing;

export function spacingScale(key: SpacingKey | undefined): number | undefined {
  if (key === undefined || !(key in primitives.spacingPx)) {
    return undefined;
  }

  return primitives.spacingPx[key] / 4;
}
