/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/navigation/railNav.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Mini-rail footer — AI (admin-parity chrome for showcase shell)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { IconAi } from '@azes/ui-web/icons';
import type { AzesNavConfig } from '@azes/ui-web/navigation';
import { createElement } from 'react';

export type CreateShowcaseRailNavOptions = {
  ai: string;
  aiCaption?: string;
  group?: string;
  onOpenAi: () => void;
};

/** Pinned footer entries for sidebar / dual-chrome mini rail. */
export function createShowcaseRailNav(options: CreateShowcaseRailNavOptions): AzesNavConfig {
  return [
    {
      id: 'rail',
      subheader: options.group,
      items: [
        {
          id: 'rail-ai',
          title: options.ai,
          caption: options.aiCaption,
          icon: createElement(IconAi, { fontSize: 'small' }),
          onClick: options.onOpenAi,
        },
      ],
    },
  ];
}
