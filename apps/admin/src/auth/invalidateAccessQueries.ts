/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/invalidateAccessQueries.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-27
 * ║ Updated: 2026-10-27
 * ║ Purpose: Invalidate /me + org-scoped access caches (Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getGetApiV1MeQueryKey } from '@azes/api/azes/auth';
import { getGetApiV1MeOrganizationsQueryKey } from '@azes/api/azes/orgs';
import type { QueryClient } from '@tanstack/react-query';

/**
 * After org-switch / role-menu / user-access / module entitlement / logout.
 * Always refreshes session bootstrap (`/me`) and membership list.
 */
export async function invalidateAccessQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: getGetApiV1MeQueryKey() }),
    queryClient.invalidateQueries({ queryKey: getGetApiV1MeOrganizationsQueryKey() }),
  ]);
}

/**
 * Broader refresh used when active org changes — drop org-scoped caches.
 * Keeps `/me` invalidation via `invalidateAccessQueries`.
 */
export async function invalidateAfterOrgSwitch(queryClient: QueryClient): Promise<void> {
  await invalidateAccessQueries(queryClient);
  await queryClient.invalidateQueries();
}
