/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/auth/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES auth API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1Me,
  getGetApiV1MeQueryKey,
  getGetApiV1MeQueryOptions,
  postApiV1AuthLogin,
  postApiV1AuthLogout,
  postApiV1AuthRefresh,
  useGetApiV1Me,
  usePostApiV1AuthLogin,
  usePostApiV1AuthLogout,
  usePostApiV1AuthRefresh,
} from '../../../generated/azes/auth/auth';
export type * from '../../../generated/azes/auth/auth';
