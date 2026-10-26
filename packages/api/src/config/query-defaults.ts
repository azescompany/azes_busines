/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/config/query-defaults.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Default TanStack Query cache/stale/retry policy for API
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { DefaultOptions } from '@tanstack/react-query';

/** Shared defaults for QueryClient instances used with @azes/api. */
export const apiQueryDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
};
