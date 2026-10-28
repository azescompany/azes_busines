/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/models/mappers.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Map OpenAPI AuditLogItem → AuditLogRow
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AuditLogItem } from '@azes/api/azes/models';

import type { AuditLogRow } from './types.js';

export function normalizeAuditLogItem(item: AuditLogItem): AuditLogRow {
  return {
    id: item.id,
    actorUserId: item.actorUserId ?? null,
    orgId: item.orgId ?? null,
    action: item.action,
    targetType: item.targetType ?? null,
    targetId: item.targetId ?? null,
    createdAt: item.createdAt,
  };
}
