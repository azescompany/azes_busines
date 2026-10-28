/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/registry.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Single source of truth for Admin apps launcher modules
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesModuleCategory, AzesModuleDef, AzesModuleMenuDef } from './types.js';

function menus(
  moduleId: string,
  items: Array<{ id: string; suffix?: string; children?: AzesModuleMenuDef['children'] }>,
): AzesModuleMenuDef[] {
  return items.map((item) => ({
    id: item.id,
    i18nKey: `apps.menus.${moduleId}.${item.id}`,
    pathSuffix: item.suffix ?? (item.id === 'overview' ? '' : `/${item.id}`),
    children: item.children,
  }));
}

function def(
  partial: Omit<AzesModuleDef, 'basePath' | 'i18nKey'> & { category: AzesModuleCategory },
): AzesModuleDef {
  return {
    ...partial,
    i18nKey: `apps.${partial.id}.title`,
    basePath: `/m/${partial.id}`,
  };
}

/**
 * 35 Odoo-inspired demo modules. Add a module = folder under modules/<id>/ + one entry here.
 */
export const MODULE_REGISTRY: readonly AzesModuleDef[] = [
  def({
    id: 'discuss',
    iconKey: 'chat',
    accent: 'info',
    category: 'productivity',
    badgeMock: 3,
    menus: menus('discuss', [{ id: 'overview' }, { id: 'channels' }, { id: 'direct' }]),
  }),
  def({
    id: 'calendar',
    iconKey: 'calendar',
    accent: 'primary',
    category: 'productivity',
    menus: menus('calendar', [{ id: 'overview' }, { id: 'meetings' }, { id: 'config' }]),
  }),
  def({
    id: 'appointments',
    iconKey: 'appointments',
    accent: 'secondary',
    category: 'productivity',
    menus: menus('appointments', [{ id: 'overview' }, { id: 'slots' }, { id: 'config' }]),
  }),
  def({
    id: 'todo',
    iconKey: 'todo',
    accent: 'warning',
    category: 'productivity',
    badgeMock: 5,
    menus: menus('todo', [{ id: 'overview' }, { id: 'lists' }, { id: 'archive' }]),
  }),
  def({
    id: 'knowledge',
    iconKey: 'knowledge',
    accent: 'info',
    category: 'productivity',
    menus: menus('knowledge', [{ id: 'overview' }, { id: 'articles' }, { id: 'workspace' }]),
  }),
  def({
    id: 'contacts',
    iconKey: 'contacts',
    accent: 'primary',
    category: 'sales',
    menus: menus('contacts', [{ id: 'overview' }, { id: 'companies' }, { id: 'tags' }]),
  }),
  def({
    id: 'crm',
    iconKey: 'crm',
    accent: 'error',
    category: 'sales',
    badgeMock: 12,
    menus: menus('crm', [
      { id: 'overview', suffix: '' },
      { id: 'pipeline' },
      { id: 'contacts' },
      { id: 'reports' },
      { id: 'config' },
    ]),
  }),
  def({
    id: 'sales',
    iconKey: 'sales',
    accent: 'success',
    category: 'sales',
    menus: menus('sales', [
      { id: 'overview', suffix: '' },
      { id: 'quotations' },
      { id: 'orders' },
      { id: 'customers' },
    ]),
  }),
  def({
    id: 'dashboards',
    iconKey: 'dashboards',
    accent: 'primary',
    category: 'sales',
    menus: menus('dashboards', [{ id: 'overview' }, { id: 'boards' }, { id: 'config' }]),
  }),
  def({
    id: 'subscriptions',
    iconKey: 'subscriptions',
    accent: 'secondary',
    category: 'sales',
    menus: menus('subscriptions', [{ id: 'overview' }, { id: 'plans' }, { id: 'invoices' }]),
  }),
  def({
    id: 'rental',
    iconKey: 'rental',
    accent: 'info',
    category: 'sales',
    menus: menus('rental', [{ id: 'overview' }, { id: 'orders' }, { id: 'products' }]),
  }),
  def({
    id: 'pos',
    iconKey: 'pos',
    accent: 'warning',
    category: 'sales',
    menus: menus('pos', [{ id: 'overview' }, { id: 'sessions' }, { id: 'config' }]),
  }),
  def({
    id: 'kitchen',
    iconKey: 'kitchen',
    accent: 'error',
    category: 'operations',
    menus: menus('kitchen', [{ id: 'overview' }, { id: 'orders' }, { id: 'displays' }]),
  }),
  def({
    id: 'accounting',
    iconKey: 'accounting',
    accent: 'success',
    category: 'finance',
    menus: menus('accounting', [
      { id: 'overview', suffix: '' },
      { id: 'journals' },
      { id: 'reports' },
      { id: 'config' },
    ]),
  }),
  def({
    id: 'documents',
    iconKey: 'documents',
    accent: 'info',
    category: 'productivity',
    menus: menus('documents', [{ id: 'overview' }, { id: 'workspace' }, { id: 'share' }]),
  }),
  def({
    id: 'project',
    iconKey: 'project',
    accent: 'primary',
    category: 'operations',
    menus: menus('project', [
      { id: 'overview', suffix: '' },
      { id: 'tasks' },
      { id: 'milestones' },
      { id: 'config' },
    ]),
  }),
  def({
    id: 'timesheets',
    iconKey: 'timesheets',
    accent: 'secondary',
    category: 'operations',
    menus: menus('timesheets', [{ id: 'overview' }, { id: 'entries' }, { id: 'reports' }]),
  }),
  def({
    id: 'planning',
    iconKey: 'planning',
    accent: 'warning',
    category: 'operations',
    menus: menus('planning', [{ id: 'overview' }, { id: 'shifts' }, { id: 'resources' }]),
  }),
  def({
    id: 'helpdesk',
    iconKey: 'helpdesk',
    accent: 'error',
    category: 'operations',
    badgeMock: 7,
    menus: menus('helpdesk', [{ id: 'overview' }, { id: 'tickets' }, { id: 'teams' }]),
  }),
  def({
    id: 'website',
    iconKey: 'website',
    accent: 'info',
    category: 'marketing',
    menus: menus('website', [{ id: 'overview' }, { id: 'pages' }, { id: 'theme' }]),
  }),
  def({
    id: 'email_marketing',
    iconKey: 'email_marketing',
    accent: 'primary',
    category: 'marketing',
    menus: menus('email_marketing', [{ id: 'overview' }, { id: 'campaigns' }, { id: 'lists' }]),
  }),
  def({
    id: 'events',
    iconKey: 'events',
    accent: 'secondary',
    category: 'marketing',
    menus: menus('events', [{ id: 'overview' }, { id: 'agenda' }, { id: 'attendees' }]),
  }),
  def({
    id: 'purchase',
    iconKey: 'purchase',
    accent: 'warning',
    category: 'operations',
    menus: menus('purchase', [
      { id: 'overview', suffix: '' },
      { id: 'requests' },
      { id: 'orders' },
      { id: 'vendors' },
    ]),
  }),
  def({
    id: 'inventory',
    iconKey: 'inventory',
    accent: 'success',
    category: 'operations',
    menus: menus('inventory', [
      { id: 'overview', suffix: '' },
      { id: 'products' },
      { id: 'transfers' },
      { id: 'warehouses' },
    ]),
  }),
  def({
    id: 'manufacturing',
    iconKey: 'manufacturing',
    accent: 'primary',
    category: 'operations',
    menus: menus('manufacturing', [{ id: 'overview' }, { id: 'orders' }, { id: 'boms' }]),
  }),
  def({
    id: 'shop_floor',
    iconKey: 'shop_floor',
    accent: 'info',
    category: 'operations',
    menus: menus('shop_floor', [{ id: 'overview' }, { id: 'workcenters' }, { id: 'boards' }]),
  }),
  def({
    id: 'barcode',
    iconKey: 'barcode',
    accent: 'secondary',
    category: 'operations',
    menus: menus('barcode', [{ id: 'overview' }, { id: 'scan' }, { id: 'config' }]),
  }),
  def({
    id: 'sign',
    iconKey: 'sign',
    accent: 'warning',
    category: 'productivity',
    menus: menus('sign', [{ id: 'overview' }, { id: 'requests' }, { id: 'templates' }]),
  }),
  def({
    id: 'employees',
    iconKey: 'employees',
    accent: 'primary',
    category: 'hr',
    menus: menus('employees', [
      { id: 'overview', suffix: '' },
      { id: 'directory' },
      { id: 'departments' },
    ]),
  }),
  def({
    id: 'recruitment',
    iconKey: 'recruitment',
    accent: 'info',
    category: 'hr',
    menus: menus('recruitment', [{ id: 'overview' }, { id: 'jobs' }, { id: 'applicants' }]),
  }),
  def({
    id: 'time_off',
    iconKey: 'time_off',
    accent: 'success',
    category: 'hr',
    menus: menus('time_off', [{ id: 'overview' }, { id: 'requests' }, { id: 'types' }]),
  }),
  def({
    id: 'payroll',
    iconKey: 'payroll',
    accent: 'error',
    category: 'hr',
    menus: menus('payroll', [
      { id: 'overview', suffix: '' },
      { id: 'payslips' },
      { id: 'employees' },
      { id: 'config' },
    ]),
  }),
  def({
    id: 'expenses',
    iconKey: 'expenses',
    accent: 'warning',
    category: 'finance',
    menus: menus('expenses', [{ id: 'overview' }, { id: 'reports' }, { id: 'categories' }]),
  }),
  def({
    id: 'apps',
    iconKey: 'apps',
    accent: 'secondary',
    category: 'system',
    menus: menus('apps', [{ id: 'overview' }, { id: 'installed' }, { id: 'store' }]),
  }),
  def({
    id: 'settings',
    iconKey: 'settings',
    accent: 'primary',
    category: 'system',
    menus: menus('settings', [{ id: 'overview' }, { id: 'general' }, { id: 'users' }]),
  }),
];

export const MODULE_CATEGORY_ORDER: readonly AzesModuleCategory[] = [
  'productivity',
  'sales',
  'finance',
  'operations',
  'marketing',
  'hr',
  'system',
] as const;
