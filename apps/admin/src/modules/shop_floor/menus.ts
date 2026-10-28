/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/shop_floor/menus.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Menu defs for shop_floor module
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MODULE_REGISTRY } from '../registry.js';
import type { AzesModuleMenuDef } from '../types.js';

export function getShopFloorMenus(): readonly AzesModuleMenuDef[] {
  const mod = MODULE_REGISTRY.find((m) => m.id === 'shop_floor');
  return mod?.menus ?? [];
}
