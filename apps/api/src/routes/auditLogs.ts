/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/auditLogs.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: SuperAdmin audit log read API (TAGET M4)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { desc } from 'drizzle-orm';
import { Hono } from 'hono';

import { requireAuth, requirePermission, type AuthedEnv } from '../auth/requireAuth.js';
import { createDb } from '../db/client.js';
import { auditLogs } from '../db/schema.js';

export function createAuditRoutes() {
  const routes = new Hono<AuthedEnv>();

  routes.get('/api/v1/audit-logs', requireAuth(), requirePermission('audit.read'), async (c) => {
    const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 200);
    if (!c.env.DB) {
      return c.json({ items: [] });
    }
    const db = createDb(c.env.DB);
    const rows = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .all();
    return c.json({
      items: rows.map((r) => ({
        id: r.id,
        actorUserId: r.actorUserId,
        orgId: r.orgId,
        action: r.action,
        targetType: r.targetType,
        targetId: r.targetId,
        meta: r.metaJson ? (JSON.parse(r.metaJson) as unknown) : null,
        createdAt: r.createdAt,
      })),
    });
  });

  return routes;
}
