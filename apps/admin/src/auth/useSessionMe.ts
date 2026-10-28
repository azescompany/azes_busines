/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/useSessionMe.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Shared GET /me bootstrap — gated by auth for soft AppShell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useGetApiV1Me } from '@azes/api/azes/auth';

export type UseSessionMeOptions = {
  /** When false (demo audience), query is disabled — no /me network. */
  enabled?: boolean;
};

/**
 * Session bootstrap — long staleTime.
 * Invalidate via `invalidateAccessQueries` on org-switch / role-menus /
 * user-access / modules / logout. `accessVersion` changes trigger sibling
 * cache drops in AdminShell.
 */
export function useSessionMe(options?: UseSessionMeOptions) {
  const enabled = options?.enabled ?? true;
  return useGetApiV1Me({
    query: {
      enabled,
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
}
