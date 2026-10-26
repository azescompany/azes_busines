/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/components/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-02
 * ║ Purpose: Merge AZES component override groups into one theme.components map
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Components, Theme } from '@mui/material/styles';

import { DEFAULT_AZES_DENSITY, densityComponentDefaults, type AzesDensity } from '../density';
import { baselineComponents } from './baseline';
import { buttonComponents } from './buttons';
import { dataDisplayComponents } from './data-display';
import { feedbackComponents } from './feedback';
import { inputComponents } from './inputs';
import { navigationComponents } from './navigation';
import { surfaceComponents } from './surfaces';

export function azesComponents(density: AzesDensity = DEFAULT_AZES_DENSITY): Components<Theme> {
  return {
    ...baselineComponents(),
    ...buttonComponents(density),
    ...densityComponentDefaults(density),
    ...inputComponents(density),
    ...surfaceComponents(),
    ...navigationComponents(),
    ...feedbackComponents(),
    ...dataDisplayComponents(density),
  };
}
