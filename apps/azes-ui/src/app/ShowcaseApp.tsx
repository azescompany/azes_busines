/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/app/ShowcaseApp.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Caspian shell + 5-phase catalog + locale menu + AI + settings
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { changeAppLocale, LOCALE_META, useTranslation, type SupportedLocale } from '@azes/i18n';
import { MuiBox } from '@azes/ui-web';
import { AzesDashboardLayout } from '@azes/ui-web/layout';
import { AzesLocaleMenu } from '@azes/ui-web/locale';
import { AzesNavProvider } from '@azes/ui-web/navigation';
import { AzesSettingsButton, AzesSettingsDrawer, useAzesSettings } from '@azes/ui-web/settings';
import { useSidePanel } from '@azes/ui-web/side-panel';
import { useMemo, useState } from 'react';

import { AiAssistantPanel } from '../components/AiAssistantPanel/index.js';
import { SHOWCASE_NAMESPACE } from '../i18n/createShowcaseI18n.js';
import { createPhaseNav } from '../navigation/phaseNav.js';
import { createShowcaseRailNav } from '../navigation/railNav.js';
import { PhaseView } from '../phases/PhaseView/index.js';
import { useHashRoute } from '../routing/useHashRoute.js';
import { ShowcaseLogo } from './ShowcaseLogo.js';

const LOCALE_OPTIONS = LOCALE_META.map((meta) => ({
  code: meta.code,
  label: meta.label,
  shortLabel: meta.shortLabel,
}));

export function ShowcaseApp() {
  const { t, i18n } = useTranslation(SHOWCASE_NAMESPACE);
  const { phaseId, navigate, router } = useHashRoute();
  const navLayout = useAzesSettings((s) => s.navLayout);
  const settingsPanel = useSidePanel('settings');
  const [aiOpen, setAiOpen] = useState(false);

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

  const phaseNav = useMemo(() => createPhaseNav(t), [t, i18n.language]);
  const railNav = useMemo(
    () =>
      createShowcaseRailNav({
        ai: t('shell.aiAria'),
        aiCaption: t('shell.aiCaption'),
        onOpenAi: () => setAiOpen(true),
      }),
    [t, i18n.language],
  );

  return (
    <AzesNavProvider router={router}>
      <AzesDashboardLayout
        nav={phaseNav}
        railNav={railNav}
        navLayout={navLayout}
        labels={shellLabels}
        slotProps={{
          footer: { flush: true },
          main: { disablePadding: true, constrain: false },
        }}
        slots={{
          logo: <ShowcaseLogo compact={navLayout === 'mini'} />,
          headerEnd: (
            <MuiBox
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                mr: { xs: 0, sm: 1 },
              }}
            >
              <AzesLocaleMenu
                value={locale}
                options={LOCALE_OPTIONS}
                label={t('language')}
                surface="nav"
                onChange={(code) => {
                  void changeAppLocale(i18n, code);
                }}
              />
            </MuiBox>
          ),
          footer: (
            <MuiBox
              component="span"
              sx={{
                display: 'block',
                width: '100%',
                py: 1.5,
                px: { xs: 2, md: 3 },
                typography: 'caption',
                color: 'text.secondary',
                borderTop: '1px solid',
                borderColor: 'border.default',
                bgcolor: 'background.paper',
              }}
            >
              {t('shell.footer')}
            </MuiBox>
          ),
        }}
      >
        <MuiBox
          data-azes-main-scroll
          sx={{
            // Content-sized: scoop alone owns vertical scroll. Do NOT set
            // overflowX (CSS would force overflow-y:auto → dual scrollbars).
            minWidth: 0,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <PhaseView phaseId={phaseId} onNavigate={navigate} />
        </MuiBox>
      </AzesDashboardLayout>

      <AiAssistantPanel open={aiOpen} onClose={() => setAiOpen(false)} />
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
