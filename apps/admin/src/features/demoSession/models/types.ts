/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/demoSession/models/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Demo mode types — ephemeral client-only rules
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** How the UI presents demo data (no server persistence). */
export type DemoMode = 'explore' | 'resetting';

/**
 * Ephemeral demo session rules (Phase sklet).
 * - Memory only — never localStorage / sessionStorage / IndexedDB.
 * - No HTTP writes to apps/api.
 * - Distinct from D1 DEMO_SEED (docs/access_control/DEMO_SEED.md).
 */
export type DemoSessionState = {
  mode: DemoMode;
  /** Active demo module id when exploring `/demo/m/:moduleId`. */
  activeModuleId: string | null;
  /** Monotonic generation — bump on reset so views remount cleanly. */
  generation: number;
};
