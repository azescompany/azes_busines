/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/landing/components/LandingShell/LandingShell.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public chrome layout — Outlet (no AuthGate / no /me)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { changeAppLocale, LOCALE_META, useTranslation, type SupportedLocale } from '@azes/i18n';
import { Alert, Link, MuiBox, MuiButton, Text, Typography, useTheme } from '@azes/ui-web';
import { AzesLocaleMenu } from '@azes/ui-web/locale';
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { pathTo, PATHS, replaceLocaleInPathname } from '../../../../app/router/paths.js';
import { adminEnv } from '../../../../config/env.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

const LOCALE_OPTIONS = LOCALE_META.map((meta) => ({
  code: meta.code,
  label: meta.label,
  shortLabel: meta.shortLabel,
}));

/** UI-only banner prefs — not demoSession / not azes.settings.v1 */
const LANDING_BANNER_KEY = 'azes.admin.landing.banner.v1';

function readBannerDismissed(): boolean {
  try {
    return window.localStorage.getItem(LANDING_BANNER_KEY) === '1';
  } catch {
    return false;
  }
}

function writeBannerDismissed(): void {
  try {
    window.localStorage.setItem(LANDING_BANNER_KEY, '1');
  } catch {
    /* ignore quota */
  }
}

function redirectToAccountLogin(returnPath: string): void {
  const returnUrl = encodeURIComponent(returnPath);
  window.location.assign(`${adminEnv.accountAppUrl}/?returnUrl=${returnUrl}`);
}

function isSupportedLocaleCode(code: string): code is SupportedLocale {
  return code === 'en' || code === 'az' || code === 'ru';
}

/** Route layout: LocaleGate child — wraps public landing + demo pages. */
export function LandingShell() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;
  const homeHref = pathTo(PATHS.home, locale);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setBannerDismissed(readBannerDismissed());
  }, []);

  const onDismissBanner = useCallback(() => {
    writeBannerDismissed();
    setBannerDismissed(true);
  }, []);

  const onLocale = (code: string) => {
    const next = (isSupportedLocaleCode(code) ? code : 'az') as SupportedLocale;
    void changeAppLocale(i18n, next);
    navigate(replaceLocaleInPathname(location.pathname, next), { replace: true });
  };

  const onLogin = () => {
    const appsHref = `${window.location.origin}${pathTo(PATHS.apps, locale)}`;
    redirectToAccountLogin(appsHref);
  };

  const wash = `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`;
  const washSoft = `color-mix(in srgb, ${theme.vars.palette.primary.main} 4%, transparent)`;

  return (
    <MuiBox
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        backgroundImage: `linear-gradient(165deg, ${wash} 0%, ${washSoft} 42%, transparent 68%)`,
        backgroundRepeat: 'no-repeat',
      }}
    >
      <MuiBox
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: {
            xs: `var(--azes-layout-header-height, ${theme.spacing(8)})`,
            lg: `var(--azes-layout-header-height, ${theme.spacing(9)})`,
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
          flexWrap: 'wrap',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: `color-mix(in srgb, ${theme.vars.palette.background.paper} 92%, transparent)`,
          backdropFilter: `blur(${theme.spacing(1.25)})`,
        }}
      >
        <Link
          href={homeHref}
          underline="none"
          color="inherit"
          aria-label={t('brand.homeAria')}
          sx={{
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 1,
            minWidth: 0,
            minHeight: theme.spacing(5),
            py: 0.5,
            '&:focus-visible': {
              outline: `2px solid ${theme.vars.palette.primary.main}`,
              outlineOffset: 3,
              borderRadius: `${theme.shape.radiusSm}px`,
            },
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              fontSize: { xs: theme.typography.body1.fontSize, md: theme.typography.h6.fontSize },
              letterSpacing: '0.14em',
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            AZES
          </Typography>
          <Typography
            component="span"
            sx={{
              fontWeight: theme.typography.fontWeightMedium,
              fontSize: theme.typography.caption.fontSize,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              lineHeight: 1.2,
            }}
          >
            COMPANY
          </Typography>
        </Link>

        <MuiBox
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: { xs: 1, sm: 1.5 },
            flexWrap: 'wrap',
            ml: 'auto',
          }}
        >
          <AzesLocaleMenu
            value={locale}
            options={LOCALE_OPTIONS}
            label={t('language')}
            onChange={onLocale}
          />
          <MuiButton
            variant="contained"
            color="primary"
            onClick={onLogin}
            sx={{ minHeight: theme.spacing(5), px: { xs: 2, sm: 2.5 } }}
          >
            {t('landing.ctaLogin')}
          </MuiButton>
        </MuiBox>
      </MuiBox>

      {!bannerDismissed ? (
        <MuiBox sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 1.5, sm: 2 } }}>
          <Alert severity="info" onClose={onDismissBanner}>
            <Text size="sm">{t('demo.banner')}</Text>
          </Alert>
        </MuiBox>
      ) : null}

      <MuiBox
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: theme.azes.layout.contentMaxWidth,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3, md: 4 },
        }}
      >
        <Outlet />
      </MuiBox>
    </MuiBox>
  );
}
