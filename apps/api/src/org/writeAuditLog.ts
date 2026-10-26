/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/org/writeAuditLog.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Audit log writer helper (TAGET M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { newId, nowSec } from '../auth/tokens.js';
import { createDb } from '../db/client.js';
import { auditLogs } from '../db/schema.js';
import type { ApiEnv } from '../env.js';

export async function writeAuditLog(
  env: ApiEnv,
  entry: {
    actorUserId?: string | null;
    orgId?: string | null;
    action: string;
    targetType: string;
    targetId?: string | null;
    meta?: unknown;
  },
): Promise<void> {
  if (!env.DB) return;
  const db = createDb(env.DB);
  await db
    .insert(auditLogs)
    .values({
      id: newId(),
      actorUserId: entry.actorUserId ?? null,
      orgId: entry.orgId ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      metaJson: entry.meta != null ? JSON.stringify(entry.meta) : null,
      createdAt: nowSec(),
    })
    .run();
}
