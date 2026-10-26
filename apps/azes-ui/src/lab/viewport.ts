/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/lab/viewport.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Demo-only viewport preview presets for the showcase content frame
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const VIEWPORT_PRESETS = [
  { id: 'fluid', label: 'Fluid', width: null },
  { id: '360', label: '360', width: 360 },
  { id: '768', label: '768', width: 768 },
  { id: '1024', label: '1024', width: 1024 },
  { id: '1440', label: '1440', width: 1440 },
] as const;

export type ViewportPresetId = (typeof VIEWPORT_PRESETS)[number]['id'];

export function viewportWidthOf(id: ViewportPresetId): number | null {
  return VIEWPORT_PRESETS.find((preset) => preset.id === id)?.width ?? null;
}
