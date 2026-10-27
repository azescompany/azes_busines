/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/sidePanelRegistry.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Register admin side-panel ids (module augmentation)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

declare module '@azes/ui-web/side-panel' {
  interface AzesSidePanelRegistry {
    /** Users create drawer (~480px / width lg). */
    adminUserCreate: true;
  }
}

export {};
