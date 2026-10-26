/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/i18n/phaseI18nKey.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Map phase id → showcase.json phases.* key segment
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { PhaseId } from '../phases/phaseRegistry.js';

/** `phase-foundations` → `foundations` (JSON path `phases.foundations`). */
export function phaseI18nSegment(phaseId: PhaseId | string): string {
  return phaseId.replace(/^phase-/, '');
}
