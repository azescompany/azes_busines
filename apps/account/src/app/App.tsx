/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/app/App.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Root application component for @azes/account (login entry)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { LoginPage } from '../features/login/LoginPage.js';
import { AppProviders } from '../providers/AppProviders.js';

export function App() {
  return (
    <AppProviders>
      <LoginPage />
    </AppProviders>
  );
}
