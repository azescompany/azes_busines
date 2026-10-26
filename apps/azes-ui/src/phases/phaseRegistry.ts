/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/phaseRegistry.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Five catalog phases — sections + band visual keys (copy via i18n)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type PhaseDiagonalEdge = 'both' | 'bottom';

export type PhaseId =
  'phase-foundations' | 'phase-controls' | 'phase-data' | 'phase-shell' | 'phase-platform';

export type PhaseMeta = {
  id: PhaseId;
  sectionIds: readonly string[];
  imageUrl: string;
  secondaryImageUrl?: string;
  diagonalEdge: PhaseDiagonalEdge;
  /** Soft | primary | dark wash intensity for hero overlay. */
  wash: 'soft' | 'primary' | 'dark';
  showSecondaryBand: boolean;
};

export const DEFAULT_PHASE_ID: PhaseId = 'phase-foundations';

export const PHASES: readonly PhaseMeta[] = [
  {
    id: 'phase-foundations',
    sectionIds: ['overview', 'colors', 'typography', 'spacing', 'radius', 'shadows', 'motion'],
    imageUrl: '/home/photos/tech-circuit.jpg',
    // No secondary photo band — single hero keeps seams clean.
    diagonalEdge: 'bottom',
    wash: 'dark',
    showSecondaryBand: false,
  },
  {
    id: 'phase-controls',
    sectionIds: ['buttons', 'inputs', 'forms', 'cards', 'accordion'],
    imageUrl: '/home/photos/p02.jpg',
    diagonalEdge: 'bottom',
    wash: 'primary',
    showSecondaryBand: false,
  },
  {
    id: 'phase-data',
    sectionIds: ['tables', 'lists', 'avatars', 'tooltips', 'alerts', 'snackbar', 'dialogs'],
    imageUrl: '/home/photos/p03.jpg',
    secondaryImageUrl: '/home/photos/baku-skyline.jpg',
    diagonalEdge: 'bottom',
    wash: 'dark',
    showSecondaryBand: true,
  },
  {
    id: 'phase-shell',
    sectionIds: ['layout', 'app-shell', 'responsive', 'navigation', 'breadcrumbs', 'menus'],
    imageUrl: '/home/photos/p04.jpg',
    diagonalEdge: 'bottom',
    wash: 'primary',
    showSecondaryBand: false,
  },
  {
    id: 'phase-platform',
    sectionIds: [
      'platform-settings',
      'platform-navigation',
      'form-binding',
      'data-grid',
      'azes-table',
      'charts',
      'pages-analytics',
      'pages-list',
      'pages-form',
      'accessibility',
    ],
    imageUrl: '/home/photos/p05.jpg',
    secondaryImageUrl: '/home/photos/p01.jpg',
    diagonalEdge: 'bottom',
    wash: 'dark',
    showSecondaryBand: true,
  },
];

const BY_ID = Object.fromEntries(PHASES.map((p) => [p.id, p])) as Record<PhaseId, PhaseMeta>;

export function isPhaseId(value: string): value is PhaseId {
  return value in BY_ID;
}

export function getPhase(id: string): PhaseMeta {
  return isPhaseId(id) ? BY_ID[id] : BY_ID[DEFAULT_PHASE_ID];
}

export function parsePhaseHash(hash: string): PhaseId | null {
  const cleaned = hash.replace(/^#\/?/, '').trim();
  if (!cleaned) return null;
  const id = cleaned.split('/')[0] ?? cleaned;
  return isPhaseId(id) ? id : null;
}

/** Resolve which catalog phase owns a demo section id. */
export function findPhaseForSection(sectionId: string): PhaseId | null {
  for (const phase of PHASES) {
    if (phase.sectionIds.includes(sectionId)) return phase.id;
  }
  return null;
}
