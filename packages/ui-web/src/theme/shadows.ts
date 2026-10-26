/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/shadows.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Map AZES shadow tokens onto the 25-step MUI elevation ladder
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import type { Shadows } from '@mui/material/styles';

const { shadow } = primitives;

const SHADOW_RGB = '15, 28, 44';

/** MUI requires 25 elevations. sm/md/lg anchor steps 1, 2, and 4; higher steps extrapolate. */
export function azesShadows(): Shadows {
  const levels = Array.from({ length: 25 }, () => 'none');
  levels[1] = shadow.sm;
  levels[2] = shadow.md;
  levels[3] = `0 8px 20px rgba(${SHADOW_RGB}, 0.14)`;
  levels[4] = shadow.lg;

  for (let elevation = 5; elevation < 25; elevation += 1) {
    const step = elevation - 4;
    const offsetY = 12 + step * 4;
    const blur = 32 + step * 8;
    const alpha = Math.min(0.16 + step * 0.02, 0.32);
    levels[elevation] = `0 ${offsetY}px ${blur}px rgba(${SHADOW_RGB}, ${alpha})`;
  }

  return levels as Shadows;
}

export type AzesCustomShadows = {
  card: string;
  dropdown: string;
  dialog: string;
  nav: string;
};

/** Named shadows for surfaces whose role matters more than their elevation number. */
export function azesCustomShadows(levels: Shadows = azesShadows()): AzesCustomShadows {
  return {
    card: levels[1],
    dropdown: levels[3],
    dialog: levels[8],
    nav: levels[2],
  };
}
