/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/admin/roles/dropdown/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: ADMIN roles/dropdown API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1RolesDropdown,
  getApiV1RolesDropdownPaged,
  getGetApiV1RolesDropdownQueryKey,
  getGetApiV1RolesDropdownQueryOptions,
  getGetApiV1RolesDropdownPagedQueryKey,
  getGetApiV1RolesDropdownPagedQueryOptions,
  useGetApiV1RolesDropdown,
  useGetApiV1RolesDropdownPaged,
} from '../../../../generated/admin/roles/roles';

export type {
  GetApiV1RolesDropdownQueryError,
  GetApiV1RolesDropdownQueryResult,
  GetApiV1RolesDropdownPagedQueryError,
  GetApiV1RolesDropdownPagedQueryResult,
} from '../../../../generated/admin/roles/roles';
