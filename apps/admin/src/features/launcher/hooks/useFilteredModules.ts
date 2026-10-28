/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/hooks/useFilteredModules.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Entitlement + search + category filter for launcher
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TFunction } from '@azes/i18n';
import { useMemo } from 'react';

import {
  MODULE_CATEGORY_ORDER,
  resolveVisibleModules,
  type AzesModuleCategory,
  type AzesModuleDef,
  type ModuleEntitlementLike,
  type ResolveVisibleModulesOptions,
} from '../../../modules/index.js';

export type AppsViewMode = 'all' | 'grouped';

export function useFilteredModules(options: {
  entitlements: readonly ModuleEntitlementLike[] | undefined;
  search: string;
  viewMode: AppsViewMode;
  t: TFunction;
  resolveOptions?: ResolveVisibleModulesOptions;
}) {
  const { entitlements, search, viewMode, t, resolveOptions } = options;

  const visible = useMemo(
    () => resolveVisibleModules(entitlements, undefined, resolveOptions),
    [entitlements, resolveOptions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((m) => {
      const title = t(m.i18nKey).toLowerCase();
      const caption = t(`apps.${m.id}.caption`).toLowerCase();
      return title.includes(q) || caption.includes(q) || m.id.includes(q);
    });
  }, [visible, search, t]);

  const grouped = useMemo(() => {
    if (viewMode !== 'grouped') return null;
    const map = new Map<AzesModuleCategory, AzesModuleDef[]>();
    for (const cat of MODULE_CATEGORY_ORDER) map.set(cat, []);
    for (const m of filtered) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return MODULE_CATEGORY_ORDER.map((cat) => ({
      category: cat,
      modules: map.get(cat) ?? [],
    })).filter((g) => g.modules.length > 0);
  }, [filtered, viewMode]);

  return { visible, filtered, grouped };
}
