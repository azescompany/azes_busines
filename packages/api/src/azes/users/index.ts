/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/users/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES users API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1Users,
  getGetApiV1UsersQueryKey,
  getGetApiV1UsersQueryOptions,
  postApiV1Users,
  useGetApiV1Users,
  usePostApiV1Users,
} from '../../../generated/azes/users/users';
export type * from '../../../generated/azes/users/users';
