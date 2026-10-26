/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/api/src/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Cloudflare Workers entry — export Hono fetch handler
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createApp } from './app.js';

const app = createApp();

export default {
  fetch: app.fetch,
};
