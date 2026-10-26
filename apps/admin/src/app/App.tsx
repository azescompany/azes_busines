/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/App.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Root application — providers + router
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { AppProviders } from '../providers/AppProviders.js';
import { AppRouter } from './router/AppRouter.js';

export function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
