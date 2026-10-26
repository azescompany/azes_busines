/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/admin/roles/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: ADMIN roles API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export * from './menus';
export * from './dropdown';

export {
  getApiV1Roles,
  getApiV1RolesId,
  getGetApiV1RolesIdQueryKey,
  getGetApiV1RolesIdQueryOptions,
  getGetApiV1RolesQueryKey,
  getGetApiV1RolesQueryOptions,
  useGetApiV1Roles,
  useGetApiV1RolesId,
} from '../../../generated/admin/roles/roles';

export type {
  GetApiV1RolesIdQueryError,
  GetApiV1RolesIdQueryResult,
  GetApiV1RolesQueryError,
  GetApiV1RolesQueryResult,
} from '../../../generated/admin/roles/roles';
