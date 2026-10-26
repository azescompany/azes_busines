/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/admin/roles/menus/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: ADMIN roles/menus API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1RolesMenus,
  getGetApiV1RolesMenusQueryKey,
  getGetApiV1RolesMenusQueryOptions,
  getPostApiV1RolesMenusMutationOptions,
  postApiV1RolesMenus,
  useGetApiV1RolesMenus,
  usePostApiV1RolesMenus,
} from '../../../../generated/admin/roles/roles';

export type {
  GetApiV1RolesMenusQueryError,
  GetApiV1RolesMenusQueryResult,
  PostApiV1RolesMenusMutationBody,
  PostApiV1RolesMenusMutationError,
  PostApiV1RolesMenusMutationResult,
} from '../../../../generated/admin/roles/roles';
