/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/menus/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES menus API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1Menus,
  getApiV1Roles,
  getApiV1RolesRoleMenus,
  getGetApiV1MenusQueryKey,
  getGetApiV1MenusQueryOptions,
  getGetApiV1RolesQueryKey,
  getGetApiV1RolesQueryOptions,
  getGetApiV1RolesRoleMenusQueryKey,
  getGetApiV1RolesRoleMenusQueryOptions,
  putApiV1RolesRoleMenus,
  useGetApiV1Menus,
  useGetApiV1Roles,
  useGetApiV1RolesRoleMenus,
  usePutApiV1RolesRoleMenus,
} from '../../../generated/azes/menus/menus';
export type * from '../../../generated/azes/menus/menus';
