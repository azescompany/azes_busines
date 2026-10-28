/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/navigation/primaryNav.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Map GET /me.nav → AzesNavConfig (tenant toolbar; home `/`)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { TFunction } from '@azes/i18n';
import { IconBusiness, IconHome, IconPeople, IconSecurity } from '@azes/ui-web/icons';
import type { AzesNavConfig } from '@azes/ui-web/navigation';
import { createElement, type ReactElement } from 'react';

export type MeNavItem = {
  id: string;
  path: string;
  i18nKey: string;
  iconKey?: string | null;
};

const ICON_MAP: Record<string, typeof IconHome> = {
  home: IconHome,
  business: IconBusiness,
  people: IconPeople,
  security: IconSecurity,
};

/** Normalize server home seeds (`/` or legacy `/apps`) to unified launcher `/`. */
function tenantNavPath(path: string): string {
  if (path === '/' || path === '' || path === '/apps') return '/';
  return path;
}

function resolveIcon(iconKey: string | null | undefined): ReactElement {
  const Comp = (iconKey && ICON_MAP[iconKey]) || IconHome;
  return createElement(Comp, { fontSize: 'small' }) as ReactElement;
}

function captionKey(i18nKey: string): string {
  if (i18nKey.endsWith('Caption')) return i18nKey;
  return `${i18nKey}Caption`;
}

function isHomePath(path: string): boolean {
  return path === '/' || path === '' || path === '/apps' || path === '/apps/';
}

/** Build primary nav from server `me.nav` (fallback: launcher home). */
export function createPrimaryNavFromMe(t: TFunction, nav: MeNavItem[] | undefined): AzesNavConfig {
  const items =
    nav && nav.length > 0
      ? nav.map((entry) => {
          const path = tenantNavPath(entry.path);
          return {
            id: entry.id,
            title: t(entry.i18nKey),
            caption: t(captionKey(entry.i18nKey)),
            path,
            match: (isHomePath(path) ? 'exact' : 'prefix') as 'exact' | 'prefix',
            icon: resolveIcon(entry.iconKey),
          };
        })
      : [
          {
            id: 'home',
            title: t('nav.home'),
            caption: t('nav.homeCaption'),
            path: '/',
            match: 'exact' as const,
            icon: resolveIcon('home'),
          },
        ];

  return [{ id: 'main', items }];
}

/** Whether a logical (locale-stripped) path is allowed by server nav. */
export function isPathAllowedByNav(logicalPath: string, nav: MeNavItem[] | undefined): boolean {
  if (!nav || nav.length === 0) {
    return isHomePath(logicalPath);
  }
  const clean = logicalPath === '' ? '/' : logicalPath;
  return nav.some((entry) => {
    const path = tenantNavPath(entry.path);
    if (isHomePath(path)) return isHomePath(clean);
    return clean === path || clean.startsWith(`${path}/`);
  });
}
