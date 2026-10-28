/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public module registry API for admin apps launcher
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { buildModuleNav } from './buildModuleNav.js';
export { resolveModuleIcon } from './iconMap.js';
export { MODULE_CATEGORY_ORDER, MODULE_REGISTRY } from './registry.js';
export {
  getModuleById,
  isModulePath,
  isPathAllowedByModules,
  parseModuleIdFromPath,
  resolveVisibleModules,
  type ModuleAccessContext,
  type ResolveVisibleModulesOptions,
} from './resolveModules.js';
export type {
  AzesModuleAccent,
  AzesModuleAccess,
  AzesModuleCategory,
  AzesModuleDef,
  AzesModuleMenuDef,
  ModuleEntitlementLike,
} from './types.js';
