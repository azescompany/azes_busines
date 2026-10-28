/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/buildModuleNav.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Translate module menu defs → AzesNavConfig
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TFunction } from '@azes/i18n';
import type { AzesNavConfig, AzesNavItem } from '@azes/ui-web/navigation';

import type { AzesModuleDef, AzesModuleMenuDef } from './types.js';

function joinPath(basePath: string, suffix: string): string {
  if (!suffix || suffix === '/') return basePath;
  const clean = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${basePath}${clean}`;
}

function mapMenuItem(mod: AzesModuleDef, def: AzesModuleMenuDef, t: TFunction): AzesNavItem {
  const path = joinPath(mod.basePath, def.pathSuffix);
  return {
    id: `${mod.id}-${def.id}`,
    title: t(def.i18nKey),
    path,
    match: def.pathSuffix === '' || def.pathSuffix === '/' ? 'exact' : 'prefix',
    children: def.children?.map((child) => mapMenuItem(mod, child, t)),
  };
}

/** Build primary nav groups for a module (translated). */
export function buildModuleNav(mod: AzesModuleDef, t: TFunction): AzesNavConfig {
  return [
    {
      id: `${mod.id}-main`,
      items: mod.menus.map((m) => mapMenuItem(mod, m, t)),
    },
  ];
}
