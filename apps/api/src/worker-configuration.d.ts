/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/worker-configuration.d.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Ambient Worker Env shape for Wrangler / TypeScript
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

interface CloudflareEnv {
  API_NAME: string;
  API_VERSION: string;
  DB: D1Database;
}
