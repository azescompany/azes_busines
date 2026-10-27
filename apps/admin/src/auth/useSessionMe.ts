/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/useSessionMe.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Shared GET /me bootstrap (nav, modules, accessVersion — Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useGetApiV1Me } from '@azes/api/azes/auth';

/**
 * Session bootstrap — long staleTime.
 * Invalidate via `invalidateAccessQueries` on org-switch / role-menus /
 * user-access / modules / logout. `accessVersion` changes trigger sibling
 * cache drops in AdminShell.
 */
export function useSessionMe() {
  return useGetApiV1Me({
    query: {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
}
