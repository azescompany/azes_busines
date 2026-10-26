/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/query/keys.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Central typed query-key factory (no ad-hoc string keys)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const apiQueryKeys = {
  all: ['azes-api'] as const,
  health: () => [...apiQueryKeys.all, 'health'] as const,
  /** Namespace for ADMIN OpenAPI queries (complements Orval-generated keys). */
  admin: () => [...apiQueryKeys.all, 'admin'] as const,
  adminResource: (name: string) => [...apiQueryKeys.admin(), 'resource', name] as const,
  /** Namespace for future domain resources once OpenAPI defines them. */
  resource: (name: string) => [...apiQueryKeys.all, 'resource', name] as const,
  resourceDetail: (name: string, id: string) =>
    [...apiQueryKeys.resource(name), 'detail', id] as const,
};

export type ApiQueryKey =
  | typeof apiQueryKeys.all
  | ReturnType<typeof apiQueryKeys.health>
  | ReturnType<typeof apiQueryKeys.admin>
  | ReturnType<typeof apiQueryKeys.adminResource>
  | ReturnType<typeof apiQueryKeys.resource>
  | ReturnType<typeof apiQueryKeys.resourceDetail>;
