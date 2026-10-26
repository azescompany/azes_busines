/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/navigation/phaseNav.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Toolbar nav — five catalog phases (flat, no per-component leaves)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TFunction } from '@azes/i18n';
import {
  IconComponents,
  IconDashboard,
  IconForm,
  IconLayout,
  IconPalette,
} from '@azes/ui-web/icons';
import type { AzesNavConfig } from '@azes/ui-web/navigation';
import { createElement, type ComponentType, type ReactElement } from 'react';

import { phaseI18nSegment } from '../i18n/phaseI18nKey.js';
import { PHASES } from '../phases/phaseRegistry.js';

type PhaseIconProps = { fontSize?: 'inherit' | 'large' | 'medium' | 'small' };

const PHASE_ICONS: Record<string, ComponentType<PhaseIconProps>> = {
  'phase-foundations': IconPalette as ComponentType<PhaseIconProps>,
  'phase-controls': IconForm as ComponentType<PhaseIconProps>,
  'phase-data': IconComponents as ComponentType<PhaseIconProps>,
  'phase-shell': IconLayout as ComponentType<PhaseIconProps>,
  'phase-platform': IconDashboard as ComponentType<PhaseIconProps>,
};

/** Five flat toolbar items — one menu entry per catalog phase. */
export function createPhaseNav(t: TFunction): AzesNavConfig {
  return [
    {
      id: 'catalog',
      subheader: t('catalog'),
      items: PHASES.map((phase) => {
        const Icon = PHASE_ICONS[phase.id] ?? IconComponents;
        const key = phaseI18nSegment(phase.id);
        return {
          id: phase.id,
          title: t(`phases.${key}.title`),
          caption: t(`phases.${key}.caption`),
          path: `/${phase.id}`,
          match: 'exact' as const,
          icon: createElement(Icon, { fontSize: 'small' }) as ReactElement,
        };
      }),
    },
  ];
}
