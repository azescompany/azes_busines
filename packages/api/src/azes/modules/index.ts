/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/modules/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES modules API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1Modules,
  getApiV1OrgsOrgIdModules,
  getGetApiV1ModulesQueryKey,
  getGetApiV1ModulesQueryOptions,
  getGetApiV1OrgsOrgIdModulesQueryKey,
  getGetApiV1OrgsOrgIdModulesQueryOptions,
  putApiV1OrgsOrgIdModules,
  useGetApiV1Modules,
  useGetApiV1OrgsOrgIdModules,
  usePutApiV1OrgsOrgIdModules,
} from '../../../generated/azes/modules/modules';
export type * from '../../../generated/azes/modules/modules';
