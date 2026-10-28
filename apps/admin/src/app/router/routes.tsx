/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/routes.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Soft AppShell + nested AuthGate for privileged routes
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { DEFAULT_LOCALE, isSupportedLocale } from '@azes/i18n';
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useParams, type RouteObject } from 'react-router';

import { AuthGate } from '../../components/AuthGate.js';
import { AdminShell } from '../../layout/AdminShell.js';
import { LocaleGate } from './LocaleGate.js';
import { modulePath, pathTo, PATHS } from './paths.js';

const HomePage = lazy(() => import('../../pages/home/index.js'));
const ModulePage = lazy(() => import('../../pages/module/index.js'));
const OrganizationsPage = lazy(() => import('../../pages/organizations/index.js'));
const OrganizationDetailPage = lazy(() => import('../../pages/organizations/detail.js'));
const UsersPage = lazy(() => import('../../pages/users/index.js'));
const UserAccessPage = lazy(() => import('../../pages/users/access.js'));
const RoleMenusPage = lazy(() => import('../../pages/role-menus/index.js'));
const PlatformRolesPage = lazy(() => import('../../pages/platform-roles/index.js'));
const CustomersPage = lazy(() => import('../../pages/customers/index.js'));
const AuditLogsPage = lazy(() => import('../../pages/audit-logs/index.js'));

function RouteFallback() {
  return null;
}

function LocaleRoot() {
  return (
    <LocaleGate>
      <Outlet />
    </LocaleGate>
  );
}

/** Soft shell — AuthGate-siz; audience demo|tenant inside AdminShell. */
function AppShell() {
  return <AdminShell />;
}

/** Privileged admin routes require session. */
function RequireAuth() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}

function LocaleHomeRedirect() {
  const { locale } = useParams();
  const next = locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  return <Navigate to={pathTo(PATHS.home, next)} replace />;
}

function LegacyAppsRedirect() {
  const { locale } = useParams();
  const next = locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  return <Navigate to={pathTo(PATHS.home, next)} replace />;
}

function LegacyDemoModuleRedirect() {
  const { locale, moduleId } = useParams();
  const next = locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const id = typeof moduleId === 'string' ? moduleId : '';
  if (!id) return <Navigate to={pathTo(PATHS.home, next)} replace />;
  return <Navigate to={pathTo(modulePath(id), next)} replace />;
}

export const adminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={pathTo(PATHS.home, DEFAULT_LOCALE)} replace />,
  },
  {
    path: '/:locale',
    element: <LocaleRoot />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<RouteFallback />}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            path: 'm/:moduleId/*',
            element: (
              <Suspense fallback={<RouteFallback />}>
                <ModulePage />
              </Suspense>
            ),
          },
          {
            path: 'demo/m/:moduleId/*',
            element: <LegacyDemoModuleRedirect />,
          },
          {
            path: 'apps',
            element: <LegacyAppsRedirect />,
          },
          {
            element: <RequireAuth />,
            children: [
              {
                path: 'organizations',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <OrganizationsPage />
                  </Suspense>
                ),
              },
              {
                path: 'organizations/:orgId',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <OrganizationDetailPage />
                  </Suspense>
                ),
              },
              {
                path: 'users',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <UsersPage />
                  </Suspense>
                ),
              },
              {
                path: 'users/:userId/access',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <UserAccessPage />
                  </Suspense>
                ),
              },
              {
                path: 'role-menus',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <RoleMenusPage />
                  </Suspense>
                ),
              },
              {
                path: 'platform-roles',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <PlatformRolesPage />
                  </Suspense>
                ),
              },
              {
                path: 'customers',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <CustomersPage />
                  </Suspense>
                ),
              },
              {
                path: 'audit-logs',
                element: (
                  <Suspense fallback={<RouteFallback />}>
                    <AuditLogsPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: '*',
            element: <LocaleHomeRedirect />,
          },
        ],
      },
    ],
  },
];
