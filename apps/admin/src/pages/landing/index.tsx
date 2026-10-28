/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/pages/landing/index.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Compat — unified home is pages/home (LauncherView)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { LauncherView } from '@/features/launcher';

/** @deprecated Prefer `pages/home` — kept if any deep link still imports this page. */
export default function LandingPage() {
  return <LauncherView />;
}
