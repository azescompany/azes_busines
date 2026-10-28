/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/demoSession/store/demoSessionStore.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: In-memory demo session — clone + reset (no persistence)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { DemoSessionState } from '../models/types.js';

const INITIAL: DemoSessionState = {
  mode: 'explore',
  activeModuleId: null,
  generation: 0,
};

let state: DemoSessionState = { ...INITIAL };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Snapshot of current ephemeral demo session (memory only). */
export function getDemoSession(): DemoSessionState {
  return state;
}

export function subscribeDemoSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setDemoActiveModule(moduleId: string | null): void {
  state = { ...state, mode: 'explore', activeModuleId: moduleId };
  emit();
}

/** Reset ephemeral demo state (in-memory clone of INITIAL). */
export function resetDemoSession(): void {
  state = {
    mode: 'explore',
    activeModuleId: null,
    generation: state.generation + 1,
  };
  emit();
}
