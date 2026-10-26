/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/useAdminRouterAdapter.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: AzesNavProvider adapter — locale-aware href + RR Link
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesRouterAdapter } from '@azes/ui-web/navigation';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router';

import { AdminNavLink } from './AdminNavLink.js';
import { pathTo, stripLocalePrefix } from './paths.js';

export function useAdminRouterAdapter(): AzesRouterAdapter {
  const location = useLocation();
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : 'az';

  return useMemo(
    () => ({
      pathname: stripLocalePrefix(location.pathname),
      toHref: (logicalPath: string) => pathTo(logicalPath, locale),
      LinkComponent: AdminNavLink,
    }),
    [location.pathname, locale],
  );
}
