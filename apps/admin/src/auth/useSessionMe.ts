/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/auth/useSessionMe.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Shared GET /me bootstrap query (TAGET M1.6 — no per-route refetch)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useGetApiV1Me } from '@azes/api/azes/auth';

/** Session bootstrap — long staleTime; invalidate on org-switch / role-menus / logout. */
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
