/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/azes/audit/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-20
 * ║ Purpose: AZES audit API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export {
  getApiV1AuditLogs,
  getGetApiV1AuditLogsQueryKey,
  getGetApiV1AuditLogsQueryOptions,
  useGetApiV1AuditLogs,
} from '../../../generated/azes/audit/audit';
export type * from '../../../generated/azes/audit/audit';
