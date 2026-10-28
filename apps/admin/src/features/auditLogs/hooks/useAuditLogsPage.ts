/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/hooks/useAuditLogsPage.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Audit page state — permission gate + list query
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useMemo, useState } from 'react';

import { checkPermission } from '../../../auth/checkPermission.js';
import { useSessionMe } from '../../../auth/useSessionMe.js';
import { useAuditLogsList } from '../service/auditLogsQueries.js';

const DEFAULT_LIMIT = 50;

export function useAuditLogsPage() {
  const me = useSessionMe();
  const canRead = checkPermission(me.data?.permissions, 'audit.read');
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [actionFilter, setActionFilter] = useState('');

  const listQuery = useAuditLogsList(limit, canRead && me.isSuccess);

  const rows = useMemo(() => {
    const items = listQuery.data ?? [];
    const q = actionFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.action.toLowerCase().includes(q));
  }, [listQuery.data, actionFilter]);

  return {
    me,
    canRead,
    limit,
    setLimit,
    actionFilter,
    setActionFilter,
    listQuery,
    rows,
  };
}
