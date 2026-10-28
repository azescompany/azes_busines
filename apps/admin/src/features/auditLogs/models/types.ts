/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/models/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Audit log view-model types (Phase 09)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AuditLogRow = {
  id: string;
  actorUserId: string | null;
  orgId: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: number;
};
