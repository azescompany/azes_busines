/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/layout/AdminShell.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Caspian L-shell — /me nav + accessVersion bootstrap (Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { changeAppLocale, LOCALE_META, useTranslation, type SupportedLocale } from '@azes/i18n';
import { useAuthClient, useAuthSession } from '@azes/auth';
import { MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { AzesDashboardLayout } from '@azes/ui-web/layout';
import { AzesAccountMenu, AzesLocaleMenu } from '@azes/ui-web/locale';
import { AzesNavProvider } from '@azes/ui-web/navigation';
import { AzesSettingsButton, AzesSettingsDrawer, useAzesSettings } from '@azes/ui-web/settings';
import { useSidePanel } from '@azes/ui-web/side-panel';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useAdminRouterAdapter } from '../app/router/useAdminRouterAdapter.js';
import { pathTo, replaceLocaleInPathname, stripLocalePrefix } from '../app/router/paths.js';
import { invalidateAccessQueries } from '../auth/invalidateAccessQueries.js';
import { useSessionMe } from '../auth/useSessionMe.js';
import { adminEnv } from '../config/env.js';
import { OrgSwitcher } from '../features/organizations/index.js';
import { ADMIN_NAMESPACE } from '../i18n/createAdminI18n.js';
import { createPrimaryNavFromMe, isPathAllowedByNav } from '../navigation/primaryNav.js';
import { createAdminRailNav } from '../navigation/railNav.js';
import { AdminLogo } from './AdminLogo.js';

const LOCALE_OPTIONS = LOCALE_META.map((meta) => ({
  code: meta.code,
  label: meta.label,
  shortLabel: meta.shortLabel,
}));

export function AdminShell() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navLayout = useAzesSettings((s) => s.navLayout);
  const settingsPanel = useSidePanel('settings');
  const router = useAdminRouterAdapter();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthSession();
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const meQuery = useSessionMe();
  const lastAccessVersion = useRef<number | undefined>(undefined);

  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;

  const shellLabels = useMemo(
    () => ({
      primaryNav: t('shell.primaryNav'),
      hideMenus: t('shell.hideMenus'),
      showMenus: t('shell.showMenus'),
      prevMenus: t('shell.prevMenus'),
      nextMenus: t('shell.nextMenus'),
      scrollToTop: t('shell.scrollToTop'),
      openNav: t('shell.openNav'),
      skipToContent: t('shell.skipToContent'),
    }),
    [t, i18n.language],
  );

  const primaryNav = useMemo(
    () => createPrimaryNavFromMe(t, meQuery.data?.nav),
    [t, i18n.language, meQuery.data?.nav],
  );
  const railNav = useMemo(() => createAdminRailNav(), []);

  useEffect(() => {
    if (!meQuery.isSuccess || !meQuery.data?.nav) return;
    const logical = stripLocalePrefix(location.pathname);
    if (!isPathAllowedByNav(logical, meQuery.data.nav)) {
      navigate(pathTo('/', locale), { replace: true });
    }
  }, [meQuery.isSuccess, meQuery.data?.nav, location.pathname, locale, navigate]);

  /** When accessVersion changes after a live refetch, drop org-scoped caches. */
  useEffect(() => {
    const version = meQuery.data?.accessVersion;
    if (typeof version !== 'number') return;
    if (lastAccessVersion.current !== undefined && lastAccessVersion.current !== version) {
      void queryClient.invalidateQueries({
        predicate: (q) => {
          const key = q.queryKey[0];
          return key !== '/api/v1/me';
        },
      });
    }
    lastAccessVersion.current = version;
  }, [meQuery.data?.accessVersion, queryClient]);

  const onLogout = () => {
    void (async () => {
      queryClient.clear();
      await authClient.clearSession();
      window.location.assign(`${adminEnv.accountAppUrl}/`);
    })();
  };

  const onLocaleChange = (code: string) => {
    const next = code as SupportedLocale;
    void changeAppLocale(i18n, next);
    const current = typeof window !== 'undefined' ? window.location.pathname : `/${locale}`;
    navigate(replaceLocaleInPathname(current, next), { replace: true });
  };

  if (meQuery.isLoading) {
    return (
      <MuiBox sx={{ p: 4 }}>
        <AzesSkeleton shape="rect" height={48} width="40%" />
        <MuiBox sx={{ mt: 2 }}>
          <AzesSkeleton shape="rect" height={320} width="100%" />
        </MuiBox>
      </MuiBox>
    );
  }

  if (meQuery.isError) {
    return (
      <MuiBox sx={{ p: 4, maxWidth: 480 }}>
        <Stack gap={2}>
          <Text size="lg" weight="semibold">
            {t('shell.meError.title')}
          </Text>
          <Text tone="muted" size="sm">
            {t('shell.meError.description')}
          </Text>
          <Stack direction="row" gap={1}>
            <MuiButton
              variant="contained"
              onClick={() => {
                void invalidateAccessQueries(queryClient);
              }}
            >
              {t('shell.meError.retry')}
            </MuiButton>
            <MuiButton variant="text" onClick={onLogout}>
              {t('account.logout')}
            </MuiButton>
          </Stack>
        </Stack>
      </MuiBox>
    );
  }

  const modules = meQuery.data?.modules ?? [];
  const blockedModules = modules.filter((m) => !m.enabled || m.subscriptionMode === 'blocked');
  const readOnlyHint =
    modules.some((m) => m.subscriptionMode === 'read_only') &&
    !modules.every((m) => m.subscriptionMode === 'blocked');

  return (
    <AzesNavProvider router={router}>
      <AzesDashboardLayout
        nav={primaryNav}
        railNav={railNav}
        navLayout={navLayout}
        labels={shellLabels}
        slotProps={{
          main: { disablePadding: false, constrain: true },
        }}
        slots={{
          logo: <AdminLogo compact={navLayout === 'mini'} />,
          headerEnd: (
            <MuiBox
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                minWidth: 0,
                mr: { xs: 0, sm: 1 },
              }}
            >
              <OrgSwitcher />
              <AzesLocaleMenu
                value={locale}
                options={LOCALE_OPTIONS}
                label={t('language')}
                surface="nav"
                onChange={onLocaleChange}
              />
              <AzesAccountMenu
                surface="nav"
                displayName={session.fullName}
                subtitle={session.role}
                label={t('account.menu')}
                logoutLabel={t('account.logout')}
                onLogout={onLogout}
              />
            </MuiBox>
          ),
        }}
      >
        <MuiBox
          data-azes-main-scroll
          sx={{
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          {blockedModules.length > 0 || readOnlyHint ? (
            <MuiBox sx={{ mb: 2 }}>
              <Text size="sm" tone="muted">
                {blockedModules.length > 0
                  ? t('shell.access.modulesBlocked', {
                      count: blockedModules.length,
                    })
                  : t('shell.access.readOnly')}
              </Text>
            </MuiBox>
          ) : null}
          <Outlet />
        </MuiBox>
      </AzesDashboardLayout>

      <AzesSettingsButton
        onClick={() => {
          void settingsPanel.toggle();
        }}
        label={t('shell.openSettings')}
      />
      <AzesSettingsDrawer />
    </AzesNavProvider>
  );
}
