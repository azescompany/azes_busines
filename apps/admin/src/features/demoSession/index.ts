/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/demoSession/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public API — ephemeral demo session sklet
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type { DemoMode, DemoSessionState } from './models/types.js';
export { loadDemoPack } from './service/demoData.js';
export {
  getDemoSession,
  resetDemoSession,
  setDemoActiveModule,
  subscribeDemoSession,
} from './store/demoSessionStore.js';
