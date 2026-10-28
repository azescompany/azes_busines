/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/landing/components/DemoModuleView/DemoModuleView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public demo module — placeholder + ephemeral reset
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation, type SupportedLocale } from '@azes/i18n';
import { MuiBox, MuiButton, Text, useTheme } from '@azes/ui-web';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import { pathTo, PATHS } from '../../../../app/router/paths.js';
import {
  getDemoSession,
  resetDemoSession,
  setDemoActiveModule,
} from '../../../demoSession/index.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { ModulePlaceholderPage } from '../../../../modules/shared/ModulePlaceholderPage.js';

export function DemoModuleView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;
  const moduleId = typeof params.moduleId === 'string' ? params.moduleId : '';
  const session = getDemoSession();

  useEffect(() => {
    if (moduleId) setDemoActiveModule(moduleId);
  }, [moduleId]);

  return (
    <MuiBox
      sx={{
        width: '100%',
        maxWidth: theme.azes.layout.contentMaxWidth,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 2.5 },
      }}
    >
      <Text size="sm" tone="muted">
        {t('demo.readOnlyNote')} · gen {session.generation}
      </Text>
      <MuiBox
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <MuiButton
          variant="outlined"
          onClick={() => {
            resetDemoSession();
            navigate(pathTo(PATHS.home, locale));
          }}
          sx={{ minHeight: theme.spacing(5) }}
        >
          {t('demo.reset')}
        </MuiButton>
        <MuiButton
          variant="text"
          onClick={() => navigate(pathTo(PATHS.home, locale))}
          sx={{ minHeight: theme.spacing(5) }}
        >
          {t('chrome.actions.back')}
        </MuiButton>
      </MuiBox>
      {/* Shared MOCK_ROWS table — no API writes */}
      <ModulePlaceholderPage />
    </MuiBox>
  );
}
