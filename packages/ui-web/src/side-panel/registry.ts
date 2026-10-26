/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/registry.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Typed side-panel id registry (module augmentation)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Augment this interface in apps/features to register panel ids:
 *
 * ```ts
 * declare module '@azes/ui-web/side-panel' {
 *   interface AzesSidePanelRegistry {
 *     adsFilters: true;
 *   }
 * }
 * ```
 */
export interface AzesSidePanelRegistry {
  /** Global settings panel (owned by `@azes/ui-web/settings`). */
  settings: true;
}

export type AzesSidePanelId = keyof AzesSidePanelRegistry;

export type AzesSidePanelWidth = 'sm' | 'md' | 'lg';
