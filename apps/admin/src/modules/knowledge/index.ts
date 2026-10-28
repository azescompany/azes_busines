/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/knowledge/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Manifest export for knowledge module
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MODULE_REGISTRY } from '../registry.js';
import type { AzesModuleDef } from '../types.js';

export const moduleId = 'knowledge' as const;

export function getManifest(): AzesModuleDef {
  const mod = MODULE_REGISTRY.find((m) => m.id === moduleId);
  if (!mod) throw new Error('Module not in registry: ' + moduleId);
  return mod;
}

export { getKnowledgeMenus as getMenus } from './menus.js';
