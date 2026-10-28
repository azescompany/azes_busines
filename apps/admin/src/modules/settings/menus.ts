/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/settings/menus.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Menu defs for settings module
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MODULE_REGISTRY } from '../registry.js';
import type { AzesModuleMenuDef } from '../types.js';

export function getSettingsMenus(): readonly AzesModuleMenuDef[] {
  const mod = MODULE_REGISTRY.find((m) => m.id === 'settings');
  return mod?.menus ?? [];
}
