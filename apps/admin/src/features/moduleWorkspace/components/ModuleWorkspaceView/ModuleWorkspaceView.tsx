/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/moduleWorkspace/components/ModuleWorkspaceView/ModuleWorkspaceView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Module workspace — MainSidebar + demo|tenant content
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAuthSession, useAuthSessionReady } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { MuiBox, MuiButton, Text } from '@azes/ui-web';
import { AzesMainSidebar } from '@azes/ui-web/layout';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

import { useAppsPrefs } from '@/features/launcher';

import { pathTo, PATHS } from '../../../../app/router/paths.js';
import { resolveAudience } from '../../../../auth/audience.js';
import {
  getDemoSession,
  resetDemoSession,
  setDemoActiveModule,
  subscribeDemoSession,
} from '../../../demoSession/index.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { buildModuleNav } from '../../../../modules/buildModuleNav.js';
import { getModuleById } from '../../../../modules/resolveModules.js';
import { ModulePlaceholderPage } from '../../../../modules/shared/ModulePlaceholderPage.js';

export function ModuleWorkspaceView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navigate = useNavigate();
  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';
  const sessionReady = useAuthSessionReady();
  const session = useAuthSession();
  const audience = resolveAudience(sessionReady && session.isAuthenticated);
  const { pushRecent } = useAppsPrefs();
  const mod = getModuleById(moduleId);
  const demoSession = useSyncExternalStore(subscribeDemoSession, getDemoSession, getDemoSession);

  const moduleNav = useMemo(() => (mod ? buildModuleNav(mod, t) : []), [mod, t, i18n.language]);

  useEffect(() => {
    if (mod) {
      pushRecent(mod.id);
      if (audience === 'demo') setDemoActiveModule(mod.id);
    }
    const scoop = document.querySelector('[data-azes-scoop]');
    if (scoop instanceof HTMLElement) scoop.scrollTop = 0;
  }, [mod, pushRecent, audience]);

  if (!mod) {
    return <Navigate to={pathTo(PATHS.home, locale)} replace />;
  }

  return (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: 'stretch',
        gap: { xs: 0, lg: 0 },
        width: '100%',
        minWidth: 0,
      }}
    >
      <AzesMainSidebar
        nav={moduleNav}
        label={t('apps.moduleSidebar.label')}
        title={t(mod.i18nKey)}
        openMenuLabel={t('apps.moduleSidebar.open')}
        closeMenuLabel={t('apps.moduleSidebar.close')}
      />
      <MuiBox sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {audience === 'demo' ? (
          <MuiBox
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
            }}
          >
            <Text size="sm" tone="muted">
              {t('demo.readOnlyNote')} · gen {demoSession.generation}
            </Text>
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => {
                resetDemoSession();
                navigate(pathTo(PATHS.home, locale));
              }}
            >
              {t('demo.reset')}
            </MuiButton>
          </MuiBox>
        ) : null}
        {/* Placeholder / MOCK_ROWS — no mutation API in demo or tenant sklet */}
        <ModulePlaceholderPage />
      </MuiBox>
    </MuiBox>
  );
}
