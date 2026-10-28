/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/pages/demo-module/index.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Compat — demo modules use ModuleWorkspaceView at /m
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { ModuleWorkspaceView } from '@/features/moduleWorkspace';

/** @deprecated Prefer `pages/module` — route redirects `/demo/m` → `/m`. */
export default function DemoModulePage() {
  return <ModuleWorkspaceView />;
}
