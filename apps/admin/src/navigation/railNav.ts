/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/navigation/railNav.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Mini-rail footer — unified launcher home `/`
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TFunction } from '@azes/i18n';
import { IconApps } from '@azes/ui-web/icons';
import type { AzesNavConfig } from '@azes/ui-web/navigation';
import { createElement } from 'react';

/** Mini-rail: return to unified launcher home. */
export function createAdminRailNav(t: TFunction): AzesNavConfig {
  return [
    {
      id: 'rail',
      items: [
        {
          id: 'rail-apps',
          title: t('apps.backToApps'),
          caption: t('apps.railCaption'),
          path: '/',
          match: 'exact',
          icon: createElement(IconApps, { fontSize: 'small' }),
        },
      ],
    },
  ];
}
