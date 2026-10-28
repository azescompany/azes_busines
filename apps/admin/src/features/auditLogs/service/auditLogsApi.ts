/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/service/auditLogsApi.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Thin wrapper over @azes/api audit list
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getApiV1AuditLogs } from '@azes/api/azes/audit';

import { normalizeAuditLogItem } from '../models/mappers.js';
import type { AuditLogRow } from '../models/types.js';

export async function fetchAuditLogs(limit: number): Promise<AuditLogRow[]> {
  const res = await getApiV1AuditLogs({ limit });
  return (res.items ?? []).map(normalizeAuditLogItem);
}
