/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Apps launcher module manifest contract
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AzesModuleAccent = 'primary' | 'info' | 'success' | 'warning' | 'error' | 'secondary';

export type AzesModuleCategory =
  'productivity' | 'sales' | 'finance' | 'operations' | 'marketing' | 'hr' | 'system';

export type AzesModuleAccess = {
  permissions?: readonly string[];
  roles?: readonly string[];
  featureFlag?: string;
};

/** Menu node before i18n — titles resolved at shell/runtime. */
export type AzesModuleMenuDef = {
  id: string;
  /** i18n key under apps.menus.<moduleId>.* */
  i18nKey: string;
  /** Path relative to module basePath, e.g. '' | '/pipeline' */
  pathSuffix: string;
  children?: readonly AzesModuleMenuDef[];
};

export type AzesModuleDef = {
  id: string;
  i18nKey: string;
  iconKey: string;
  accent: AzesModuleAccent;
  category: AzesModuleCategory;
  basePath: string;
  access?: AzesModuleAccess;
  menus: readonly AzesModuleMenuDef[];
  /** Mock badge count for launcher tile (optional). */
  badgeMock?: number;
  remote?: { repo?: string; entry?: string };
};

export type ModuleEntitlementLike = {
  code: string;
  enabled: boolean;
  subscriptionMode?: string;
};
