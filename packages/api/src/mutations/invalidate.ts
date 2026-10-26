/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/mutations/invalidate.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Shared mutation invalidation helpers for QueryClient
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { QueryClient } from '@tanstack/react-query';

import { apiQueryKeys } from '../query/keys';

export async function invalidateAllApiQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: apiQueryKeys.all });
}

export async function invalidateResourceQueries(
  queryClient: QueryClient,
  resourceName: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: apiQueryKeys.resource(resourceName) });
}

export async function invalidateAdminQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: apiQueryKeys.admin() });
}

export async function invalidateAdminResourceQueries(
  queryClient: QueryClient,
  resourceName: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: apiQueryKeys.adminResource(resourceName) });
}
