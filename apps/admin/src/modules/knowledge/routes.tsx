/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/knowledge/routes.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Lazy route entry for knowledge (local; remote-ready)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { lazy } from 'react';

/** Local resolver — swap for remote() when module federation lands. */
export const ModulePage = lazy(() =>
  import('../shared/ModulePlaceholderPage.js').then((m) => ({ default: m.ModulePlaceholderPage })),
);
