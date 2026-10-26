/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/db/client.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Drizzle client over Cloudflare D1 binding
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { drizzle } from 'drizzle-orm/d1';

import * as schema from './schema.js';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type ApiDb = ReturnType<typeof createDb>;
