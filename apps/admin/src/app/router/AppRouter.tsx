/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/AppRouter.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: createBrowserRouter + RouterProvider for @azes/admin
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { adminRoutes } from './routes.js';

export function AppRouter() {
  const router = useMemo(
    () =>
      createBrowserRouter(adminRoutes, {
        basename: import.meta.env.BASE_URL,
      }),
    [],
  );

  return <RouterProvider router={router} />;
}
