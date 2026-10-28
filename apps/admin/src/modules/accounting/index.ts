/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/accounting/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Manifest export for accounting module
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MODULE_REGISTRY } from '../registry.js';
import type { AzesModuleDef } from '../types.js';

export const moduleId = 'accounting' as const;

export function getManifest(): AzesModuleDef {
  const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
  if (!mod) throw new Error('Module not in registry: ' + moduleId);
  return mod;
}

export { getAccountingMenus as getMenus } from './menus.js';
