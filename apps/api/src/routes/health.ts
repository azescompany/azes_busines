/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/routes/health.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Health probes — no secrets or env dumps
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Hono } from 'hono';

import type { ApiEnv } from '../env.js';
import { parseApiVars } from '../env.js';

export const healthRoutes = new Hono<{ Bindings: ApiEnv }>();

healthRoutes.get('/health', (c) => {
  return c.json({
    ok: true,
    service: parseApiVars(c.env).API_NAME,
  });
});

healthRoutes.get('/api/v1/health', (c) => {
  const vars = parseApiVars(c.env);
  return c.json({
    ok: true,
    service: vars.API_NAME,
    apiVersion: vars.API_VERSION,
    status: 'up',
  });
});
