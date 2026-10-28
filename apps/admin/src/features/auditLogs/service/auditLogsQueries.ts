/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/service/auditLogsQueries.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Audit logs query keys + hook
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useQuery } from '@tanstack/react-query';

import { fetchAuditLogs } from './auditLogsApi.js';

export const auditLogsKeys = {
  all: ['audit-logs'] as const,
  list: (limit: number) => [...auditLogsKeys.all, 'list', limit] as const,
};

export function useAuditLogsList(limit: number, enabled: boolean) {
  return useQuery({
    queryKey: auditLogsKeys.list(limit),
    queryFn: () => fetchAuditLogs(limit),
    enabled,
  });
}
