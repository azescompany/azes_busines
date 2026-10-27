/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/routes.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Admin route tree — locale + auth + shell + M1 / M1.5 pages
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { DEFAULT_LOCALE, isSupportedLocale } from '@azes/i18n';
import { lazy, Suspense } from 'react';
import { Navigate, useParams, type RouteObject } from 'react-router';

import { AuthGate } from '../../components/AuthGate.js';
import { AdminShell } from '../../layout/AdminShell.js';
import { LocaleGate } from './LocaleGate.js';
import { pathTo, PATHS } from './paths.js';

const HomePage = lazy(() => import('../../pages/home/index.js'));
const OrganizationsPage = lazy(() => import('../../pages/organizations/index.js'));
const OrganizationDetailPage = lazy(() => import('../../pages/organizations/detail.js'));
const UsersPage = lazy(() => import('../../pages/users/index.js'));
const UserAccessPage = lazy(() => import('../../pages/users/access.js'));
const RoleMenusPage = lazy(() => import('../../pages/role-menus/index.js'));
const PlatformRolesPage = lazy(() => import('../../pages/platform-roles/index.js'));
const CustomersPage = lazy(() => import('../../pages/customers/index.js'));

function RouteFallback() {
  return null;
}

function LocaleAuthShell() {
  return (
    <LocaleGate>
      <AuthGate>
        <AdminShell />
      </AuthGate>
    </LocaleGate>
  );
}

function LocaleHomeRedirect() {
  const { locale } = useParams();
  const next = locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  return <Navigate to={pathTo(PATHS.home, next)} replace />;
}

export const adminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={pathTo(PATHS.home, DEFAULT_LOCALE)} replace />,
  },
  {
    path: '/:locale',
    element: <LocaleAuthShell />,
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
        path: '*',
        element: <LocaleHomeRedirect />,
      },
    ],
  },
];
