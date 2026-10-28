/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/layout/AdminShell.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-28
 * ║ Purpose: Unified AppShell — demo|tenant audience on AzesDashboardLayout
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { changeAppLocale, LOCALE_META, useTranslation, type SupportedLocale } from '@azes/i18n';
import { useAuthClient, useAuthSession, useAuthSessionReady } from '@azes/auth';
import { IconButton, MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { IconApps } from '@azes/ui-web/icons';
import { AzesDashboardLayout } from '@azes/ui-web/layout';
import { AzesAccountMenu, AzesLocaleMenu } from '@azes/ui-web/locale';
import { AzesNavProvider } from '@azes/ui-web/navigation';
import { AzesSettingsButton, AzesSettingsDrawer, useAzesSettings } from '@azes/ui-web/settings';
import { useSidePanel } from '@azes/ui-web/side-panel';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useAdminRouterAdapter } from '../app/router/useAdminRouterAdapter.js';
import { pathTo, PATHS, replaceLocaleInPathname, stripLocalePrefix } from '../app/router/paths.js';
import { resolveAudience } from '../auth/audience.js';
import { invalidateAccessQueries } from '../auth/invalidateAccessQueries.js';
import { useSessionMe } from '../auth/useSessionMe.js';
import { adminEnv } from '../config/env.js';
import { OrgSwitcher } from '../features/organizations/index.js';
import { ADMIN_NAMESPACE } from '../i18n/createAdminI18n.js';
import { isAdminPathAllowed } from '../modules/pathGuard.js';
import { getModuleById, parseModuleIdFromPath } from '../modules/resolveModules.js';
import { createPrimaryNavFromMe } from '../navigation/primaryNav.js';
import { createAdminRailNav } from '../navigation/railNav.js';
import { AdminLogo } from './AdminLogo.js';

const LOCALE_OPTIONS = LOCALE_META.map((meta) => ({
  code: meta.code,
  label: meta.label,
  shortLabel: meta.shortLabel,
}));

function redirectToAccountLogin(returnPath: string): void {
  const returnUrl = encodeURIComponent(returnPath);
  window.location.assign(`${adminEnv.accountAppUrl}/?returnUrl=${returnUrl}`);
}

export function AdminShell() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navLayout = useAzesSettings((s) => s.navLayout);
  const settingsPanel = useSidePanel('settings');
  const router = useAdminRouterAdapter();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionReady = useAuthSessionReady();
  const session = useAuthSession();
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const lastAccessVersion = useRef<number | undefined>(undefined);

  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;
  const logicalPath = stripLocalePrefix(location.pathname);
  const moduleId = parseModuleIdFromPath(logicalPath);
  const activeModule = getModuleById(moduleId);

  const audience = resolveAudience(sessionReady && session.isAuthenticated);
  const isTenant = audience === 'tenant';

  const meQuery = useSessionMe({ enabled: isTenant });

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

  const primaryNav = useMemo(() => {
    if (!isTenant) return [];
    return createPrimaryNavFromMe(t, meQuery.data?.nav);
  }, [isTenant, t, i18n.language, meQuery.data?.nav]);

  const railNav = useMemo(() => createAdminRailNav(t), [t, i18n.language]);

  useEffect(() => {
    if (!isTenant || !meQuery.isSuccess) return;
    if (!isAdminPathAllowed(logicalPath, meQuery.data?.nav)) {
      navigate(pathTo(PATHS.home, locale), { replace: true });
    }
  }, [isTenant, meQuery.isSuccess, meQuery.data?.nav, logicalPath, locale, navigate]);

  useEffect(() => {
    if (!isTenant) return;
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
  }, [isTenant, meQuery.data?.accessVersion, queryClient]);

  const onLogout = () => {
    void (async () => {
      queryClient.clear();
      await authClient.clearSession();
      window.location.assign(`${adminEnv.accountAppUrl}/`);
    })();
  };

  const onLogin = () => {
    const homeHref = `${window.location.origin}${pathTo(PATHS.home, locale)}`;
    redirectToAccountLogin(homeHref);
  };

  const onLocaleChange = (code: string) => {
    const next = code as SupportedLocale;
    void changeAppLocale(i18n, next);
    const current = typeof window !== 'undefined' ? window.location.pathname : `/${locale}`;
    navigate(replaceLocaleInPathname(current, next), { replace: true });
  };

  // Soft shell: wait for auth hydrate only (do not block demo on /me).
  if (!sessionReady) {
    return (
      <MuiBox sx={{ p: 4 }}>
        <AzesSkeleton shape="rect" height={48} width="40%" />
        <MuiBox sx={{ mt: 2 }}>
          <AzesSkeleton shape="rect" height={320} width="100%" />
        </MuiBox>
      </MuiBox>
    );
  }

  // Tenant only: block on /me load/error (not demo).
  if (isTenant && meQuery.isLoading) {
    return (
      <MuiBox sx={{ p: 4 }}>
        <AzesSkeleton shape="rect" height={48} width="40%" />
        <MuiBox sx={{ mt: 2 }}>
          <AzesSkeleton shape="rect" height={320} width="100%" />
        </MuiBox>
      </MuiBox>
    );
  }

  if (isTenant && meQuery.isError) {
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

  const modules = isTenant ? (meQuery.data?.modules ?? []) : [];
  const blockedModules = modules.filter((m) => !m.enabled || m.subscriptionMode === 'blocked');
  const readOnlyHint =
    modules.some((m) => m.subscriptionMode === 'read_only') &&
    !modules.every((m) => m.subscriptionMode === 'blocked');

  let headerStart: ReactNode;
  if (activeModule) {
    headerStart = (
      <MuiBox
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
          mr: 1,
        }}
      >
        <IconButton
          size="small"
          aria-label={t('apps.backToApps')}
          onClick={() => navigate(pathTo(PATHS.home, locale))}
        >
          <IconApps />
        </IconButton>
        <Text size="sm" weight="semibold">
          {t(activeModule.i18nKey)}
        </Text>
      </MuiBox>
    );
  } else {
    headerStart = undefined;
  }

  const headerEnd = (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: { xs: 1, sm: 1.5 },
        minWidth: 0,
        maxWidth: '100%',
        mr: { xs: 0, sm: 1 },
      }}
    >
      {isTenant ? <OrgSwitcher /> : null}
      <AzesLocaleMenu
        value={locale}
        options={LOCALE_OPTIONS}
        label={t('language')}
        surface="nav"
        onChange={onLocaleChange}
      />
      {isTenant ? (
        <AzesAccountMenu
          surface="nav"
          displayName={session.fullName}
          subtitle={session.role}
          label={t('account.menu')}
          logoutLabel={t('account.logout')}
          onLogout={onLogout}
        />
      ) : (
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={onLogin}
          sx={{
            minHeight: (theme) => theme.spacing(4.5),
            px: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          {t('landing.ctaLogin')}
        </MuiButton>
      )}
    </MuiBox>
  );

  return (
    <AzesNavProvider router={router}>
      <AzesDashboardLayout
        nav={primaryNav}
        railNav={railNav}
        hidePrimaryNav={!isTenant}
        navLayout={navLayout}
        labels={shellLabels}
        slotProps={{
          main: { disablePadding: false, constrain: true },
        }}
        slots={{
          logo: <AdminLogo compact={navLayout === 'mini'} />,
          headerStart,
          headerEnd,
        }}
      >
        <MuiBox
          data-azes-main-scroll
          data-azes-audience={audience}
          sx={{
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2.5, sm: 3, md: 4 },
          }}
        >
          {isTenant && (blockedModules.length > 0 || readOnlyHint) ? (
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
