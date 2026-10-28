/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/landing/components/LandingView/LandingView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public landing content — hero + MODULE_REGISTRY grid
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation, type SupportedLocale } from '@azes/i18n';
import { MuiBox, MuiButton, Text, Typography, useTheme } from '@azes/ui-web';

import { pathTo, PATHS } from '../../../../app/router/paths.js';
import { adminEnv } from '../../../../config/env.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { LandingModuleGrid } from '../LandingModuleGrid/index.js';

export function LandingView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;

  const onLogin = () => {
    const appsHref = `${window.location.origin}${pathTo(PATHS.apps, locale)}`;
    const returnUrl = encodeURIComponent(appsHref);
    window.location.assign(`${adminEnv.accountAppUrl}/?returnUrl=${returnUrl}`);
  };

  const onExplore = () => {
    document
      .getElementById('landing-modules')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <MuiBox
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* First viewport: one composition — brand, subtitle, CTA, hint */}
      <MuiBox
        sx={{
          maxWidth: theme.spacing(80),
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography
          component="p"
          sx={{
            m: 0,
            fontWeight: theme.typography.fontWeightBold,
            fontSize: theme.typography.caption.fontSize,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'primary.main',
          }}
        >
          AZES COMPANY
        </Typography>
        <Text size="xl" weight="bold">
          {t('landing.title')}
        </Text>
        <Text tone="muted">{t('landing.subtitle')}</Text>
        <MuiBox
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1.5, sm: 2 },
            pt: 0.5,
          }}
        >
          <MuiButton
            variant="contained"
            color="primary"
            onClick={onLogin}
            sx={{ minHeight: theme.spacing(5.5), px: 3 }}
          >
            {t('landing.ctaLogin')}
          </MuiButton>
          <MuiButton
            variant="outlined"
            color="inherit"
            onClick={onExplore}
            sx={{ minHeight: theme.spacing(5.5), px: 3 }}
          >
            {t('landing.ctaExplore')}
          </MuiButton>
        </MuiBox>
        <Text size="sm" tone="muted">
          {t('landing.demoHint')}
        </Text>
      </MuiBox>

      <MuiBox
        id="landing-modules"
        component="section"
        aria-label={t('landing.ctaExplore')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2, sm: 2.5 },
          scrollMarginTop: theme.spacing(10),
        }}
      >
        <Text size="md" weight="semibold">
          {t('landing.ctaExplore')}
        </Text>
        <LandingModuleGrid />
      </MuiBox>
    </MuiBox>
  );
}
