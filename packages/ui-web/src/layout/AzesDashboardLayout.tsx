/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesDashboardLayout.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-16
 * ║ Purpose: Dashboard shell — scoop resets canvas text color (anti white-on-white)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import AppsIcon from '@mui/icons-material/Apps';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { Breakpoint } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { navToneVars } from '../navigation/navStyles';
import type { AzesNavConfig } from '../navigation/types';
import {
  useOptionalAzesSettings,
  useOptionalAzesSettingsActions,
} from '../settings/AzesSettingsProvider';
import {
  DEFAULT_AZES_SETTINGS,
  type AzesContainer,
  type AzesHeaderMode,
  type AzesNavColor,
  type AzesNavLayout,
} from '../settings/types';
import { appsTriggerSx } from './appsTriggerSx';
import { AzesHeader, CHROME_MOTION_MS, type AzesHeaderProps } from './AzesHeader';
import { AzesLayoutVars } from './AzesLayoutVars';
import {
  AzesFooter,
  AzesMainContent,
  AzesSkipLink,
  type AzesFooterProps,
  type AzesMainContentProps,
} from './AzesMainContent';
import { AzesHorizontalNav, AzesMobileNav, AzesVerticalNav } from './AzesNavContainers';
import { AzesScrollToTop } from './AzesScrollToTop';

export type AzesLayoutLabels = {
  primaryNav: string;
  openNav: string;
  collapseNav: string;
  expandNav: string;
  skipToContent: string;
  hideMenus: string;
  showMenus: string;
  scrollToTop: string;
  /** Horizontal menus scroller — previous chunk. */
  prevMenus: string;
  /** Horizontal menus scroller — next chunk. */
  nextMenus: string;
};

export const DEFAULT_AZES_LAYOUT_LABELS: AzesLayoutLabels = {
  primaryNav: 'Primary',
  openNav: 'Open navigation',
  collapseNav: 'Collapse navigation',
  expandNav: 'Expand navigation',
  skipToContent: 'Skip to content',
  hideMenus: 'Hide menus',
  showMenus: 'Show menus',
  scrollToTop: 'Back to top',
  prevMenus: 'Previous menus',
  nextMenus: 'Next menus',
};

export type AzesDashboardLayoutSlots = {
  logo?: ReactNode;
  headerStart?: ReactNode;
  headerCenter?: ReactNode;
  headerEnd?: ReactNode;
  navTop?: ReactNode;
  navBottom?: ReactNode;
  footer?: ReactNode;
};

export type AzesDashboardLayoutProps = {
  nav: AzesNavConfig;
  /**
   * Dual chrome (desktop): mini-rail items (Docs, AI) — previous rail design.
   * Mobile drawer: same items pinned in the sidebar footer.
   */
  railNav?: AzesNavConfig;
  /** Horizontal menus toolbar skeleton until API menus resolve. */
  navLoading?: boolean;
  /** Defaults to the settings value, then `horizontal`. */
  navLayout?: AzesNavLayout;
  navColor?: AzesNavColor;
  container?: AzesContainer;
  /** Defaults to settings `headerMode`, then `autoHide`. */
  headerMode?: AzesHeaderMode;
  /** Breakpoint where the desktop nav replaces the mobile drawer. Default `lg`. */
  layoutQuery?: Breakpoint;
  slots?: AzesDashboardLayoutSlots;
  slotProps?: {
    header?: Pick<
      AzesHeaderProps,
      'elevateOnScroll' | 'hideOnScroll' | 'forceVisible' | 'visibilityPin'
    >;
    main?: Pick<AzesMainContentProps, 'disablePadding' | 'fill' | 'constrain'>;
    footer?: Pick<AzesFooterProps, 'flush' | 'container'>;
  };
  labels?: Partial<AzesLayoutLabels>;
  /** Called by the mini toggle. Default: writes `navLayout` to settings when a provider exists. */
  onNavLayoutChange?: (layout: AzesNavLayout) => void;
  children: ReactNode;
};

export function AzesDashboardLayout({
  nav,
  railNav,
  navLoading = false,
  navLayout: navLayoutProp,
  navColor: navColorProp,
  container: containerProp,
  headerMode: headerModeProp,
  layoutQuery = 'lg',
  slots = {},
  slotProps = {},
  labels: labelsProp,
  onNavLayoutChange,
  children,
}: AzesDashboardLayoutProps) {
  const labels = { ...DEFAULT_AZES_LAYOUT_LABELS, ...labelsProp };
  const settingsNavLayout = useOptionalAzesSettings((s) => s.navLayout);
  const settingsNavColor = useOptionalAzesSettings((s) => s.navColor);
  const settingsContainer = useOptionalAzesSettings((s) => s.container);
  const settingsHeaderMode = useOptionalAzesSettings((s) => s.headerMode);
  const actions = useOptionalAzesSettingsActions();

  const navLayout = navLayoutProp ?? settingsNavLayout ?? DEFAULT_AZES_SETTINGS.navLayout;
  const navColor = navColorProp ?? settingsNavColor ?? DEFAULT_AZES_SETTINGS.navColor;
  const container = containerProp ?? settingsContainer ?? DEFAULT_AZES_SETTINGS.container;
  const headerMode = headerModeProp ?? settingsHeaderMode ?? DEFAULT_AZES_SETTINGS.headerMode;
  const hideOnScroll = headerMode === 'autoHide';

  const theme = useTheme();
  // SSR-safe: do NOT use `noSsr: true` — that evaluates the real viewport on the client's
  // first paint while the server used `defaultMatches` (false), forking dual vs fixed-rail
  // trees and causing hydration mismatch (nav[data-azes-rail] vs data-azes-layout-column).
  // MUI default: server + first client paint share defaultMatches; then update after mount.
  const isDesktop = useMediaQuery(theme.breakpoints.up(layoutQuery));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [horizontalMenusOpen, setHorizontalMenusOpen] = useState(true);
  /** Bumped when Apps re-opens menus — briefly pins chrome, then auto-hide resumes. */
  const [visibilityPin, setVisibilityPin] = useState(0);
  /** L-shell scoop scrollport — header auto-hide listens here, not the window. */
  const [scoopEl, setScoopEl] = useState<HTMLElement | null>(null);
  /** When header auto-hides, flatten scoop↔rail join; restore curve on show. */
  const [chromeConcealed, setChromeConcealed] = useState(false);
  const scoopRef = useCallback((node: HTMLDivElement | null) => {
    setScoopEl(node);
  }, []);
  const onHeaderConcealedChange = useCallback((concealed: boolean) => {
    setChromeConcealed(concealed);
  }, []);

  const changeLayout =
    onNavLayoutChange ??
    (actions ? (value: AzesNavLayout) => actions.set({ navLayout: value }) : undefined);
  // `horizontal` = mini rail + menus toolbar (dual chrome).
  const isSide = navLayout === 'vertical' || navLayout === 'mini' || navLayout === 'horizontal';
  const isMiniRail = navLayout === 'mini' || navLayout === 'horizontal';
  const isHorizontal = navLayout === 'horizontal';
  const isDual = isHorizontal && isDesktop;
  const showMobileTrigger = !isDesktop;
  const menusId = 'azes-horizontal-menus';
  const lShell = isSide && isDesktop;
  /** Desktop dual chrome: Docs/AI live in the mini rail (legacy). */
  const resolvedRailNav = railNav ?? (isDual ? [] : undefined);
  /** Mobile only: pin Docs/AI in the drawer footer. */
  const mobileFooterNav = !isDesktop ? railNav : undefined;

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (navLayout === 'horizontal') setHorizontalMenusOpen(true);
  }, [navLayout]);

  useEffect(() => {
    if (!lShell || !hideOnScroll) setChromeConcealed(false);
  }, [lShell, hideOnScroll]);

  // Dual chrome brand strip:
  // - Menus open: logo flush to the rail edge (mark stacked over sidebar icons).
  // - Menus hide: Apps waffle occupies the rail column; logo slides inline-end.
  const appsCollapsed = isHorizontal && isDesktop && !horizontalMenusOpen;
  const showHeaderLogo = Boolean(slots.logo) && (isDual || !isDesktop);

  const headerStart = (
    <>
      {showMobileTrigger ? (
        <IconButton
          edge="start"
          aria-label={labels.openNav}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      ) : null}
      {isHorizontal && isDesktop ? (
        <Box
          data-azes-brand-strip=""
          data-azes-apps-collapsed={appsCollapsed ? 'true' : 'false'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: 0,
            // Cancel header page padding so brand starts on the rail’s start edge.
            marginInlineStart: 'calc(-1 * var(--azes-layout-page-padding))',
          }}
        >
          <Box
            sx={(t) => ({
              width: 'var(--azes-layout-nav-width)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: appsCollapsed ? 1 : 0,
              pointerEvents: appsCollapsed ? 'auto' : 'none',
              transition: t.transitions.create(['opacity'], {
                duration: CHROME_MOTION_MS,
                easing: t.transitions.easing.easeInOut,
              }),
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            })}
          >
            <IconButton
              aria-label={labels.showMenus}
              aria-expanded={false}
              aria-controls={menusId}
              tabIndex={appsCollapsed ? undefined : -1}
              onClick={() => {
                setHorizontalMenusOpen(true);
                setVisibilityPin((n) => n + 1);
              }}
              sx={(t) => appsTriggerSx(t, 'header')}
            >
              <AppsIcon />
            </IconButton>
          </Box>
          {showHeaderLogo ? (
            <Box
              sx={(t) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
                minWidth: 0,
                // Slight inset from the viewport start edge (rail stack).
                paddingInlineStart: '12px',
                // Menus open → pull back over the rail column; collapsed → after Apps.
                marginInlineStart: appsCollapsed ? 0 : 'calc(-1 * var(--azes-layout-nav-width))',
                transition: t.transitions.create(['margin'], {
                  duration: CHROME_MOTION_MS,
                  easing: t.transitions.easing.easeInOut,
                }),
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              })}
            >
              {slots.logo}
            </Box>
          ) : null}
        </Box>
      ) : showHeaderLogo ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {slots.logo}
        </Box>
      ) : null}
      {slots.headerStart}
    </>
  );

  const horizontalTop =
    isHorizontal && isDesktop ? (
      <Box
        sx={(t) => ({
          display: 'grid',
          gridTemplateRows: horizontalMenusOpen ? '1fr' : '0fr',
          transition: t.transitions.create('grid-template-rows', {
            duration: 320,
            easing: t.transitions.easing.easeInOut,
          }),
        })}
      >
        <Box
          sx={{
            // Clip vertical collapse only — keep x free so the menus scrollbar can paint.
            overflowX: 'visible',
            overflowY: 'hidden',
            minHeight: 0,
            minWidth: 0,
            opacity: horizontalMenusOpen ? 1 : 0,
            pointerEvents: horizontalMenusOpen ? 'auto' : 'none',
            transition: theme.transitions.create('opacity', {
              duration: 280,
              easing: theme.transitions.easing.easeInOut,
            }),
          }}
        >
          <AzesHorizontalNav
            config={nav}
            loading={navLoading}
            tone={navColor}
            label={labels.primaryNav}
            layoutQuery={layoutQuery}
            menusId={menusId}
            hideMenusLabel={labels.hideMenus}
            prevMenusLabel={labels.prevMenus}
            nextMenusLabel={labels.nextMenus}
            onHideMenus={() => setHorizontalMenusOpen(false)}
          />
        </Box>
      </Box>
    ) : null;

  const mainAndFooter = (
    <>
      <AzesMainContent container={container} {...slotProps.main}>
        {children}
      </AzesMainContent>
      {slots.footer ? (
        <AzesFooter container={container} {...slotProps.footer}>
          {slots.footer}
        </AzesFooter>
      ) : null}
    </>
  );

  const header = (
    <AzesHeader
      {...slotProps.header}
      hideOnScroll={hideOnScroll}
      visibilityPin={Math.max(visibilityPin, slotProps.header?.visibilityPin ?? 0)}
      chromeJoin={lShell}
      scrollTarget={lShell ? scoopEl : null}
      onConcealedChange={lShell ? onHeaderConcealedChange : undefined}
      tone={navColor}
      top={horizontalTop}
      start={headerStart}
      center={slots.headerCenter}
      end={slots.headerEnd}
    />
  );

  // Join curve only while chrome is visible; flatten with the same motion as header hide.
  const scoopJoinFlat = lShell && chromeConcealed;

  const scoop = (
    <Box
      ref={scoopRef}
      data-azes-scoop=""
      data-azes-scoop-join={scoopJoinFlat ? 'flat' : 'curve'}
      sx={(t) => ({
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
        borderStartStartRadius: scoopJoinFlat ? 0 : 'var(--azes-layout-chrome-join)',
        backgroundColor: t.vars.palette.background.default,
        // Canvas ink — always theme text (never inherit contrast chrome white).
        color: t.vars.palette.text.primary,
        scrollbarWidth: 'thin',
        transition: t.transitions.create('border-start-start-radius', {
          duration: CHROME_MOTION_MS,
          easing: t.transitions.easing.easeInOut,
        }),
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      })}
    >
      {mainAndFooter}
    </Box>
  );

  // Dual chrome: full-bleed toolbar/header on top; mini rail + scoop below (no left gap).
  if (isDual) {
    return (
      <AzesLayoutVars layoutQuery={layoutQuery} navLayout={navLayout}>
        <AzesSkipLink label={labels.skipToContent} />
        <Box
          data-azes-layout-column=""
          sx={(t) => ({
            // Chrome frame (behind scoop join curve) matches sidebar/header surface.
            ...navToneVars(t, navColor),
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            maxHeight: '100dvh',
            overflow: 'hidden',
            backgroundColor: 'var(--azes-nav-bg)',
            transition: t.transitions.create(['background-color'], { duration: 200 }),
          })}
        >
          {header}
          <Box
            sx={{
              display: 'flex',
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              backgroundColor: 'var(--azes-nav-bg)',
            }}
          >
            <AzesVerticalNav
              config={resolvedRailNav ?? []}
              tone={navColor}
              label={labels.primaryNav}
              layoutQuery={layoutQuery}
              mini
              placement="docked"
              hideBrand
              top={slots.navTop}
              bottom={slots.navBottom}
            />
            {scoop}
          </Box>
        </Box>
        <AzesScrollToTop scrollTarget={lShell ? scoopEl : null} label={labels.scrollToTop} />
      </AzesLayoutVars>
    );
  }

  return (
    <AzesLayoutVars layoutQuery={layoutQuery} navLayout={navLayout}>
      <AzesSkipLink label={labels.skipToContent} />
      {isSide ? (
        <AzesVerticalNav
          config={nav}
          tone={navColor}
          label={labels.primaryNav}
          layoutQuery={layoutQuery}
          mini={isMiniRail}
          logo={slots.logo}
          top={isMiniRail ? null : slots.navTop}
          bottom={isMiniRail ? null : slots.navBottom}
          onToggleMini={
            changeLayout && navLayout !== 'horizontal'
              ? () => changeLayout(navLayout === 'mini' ? 'vertical' : 'mini')
              : undefined
          }
          toggleLabel={navLayout === 'mini' ? labels.expandNav : labels.collapseNav}
        />
      ) : null}
      {isDesktop ? null : (
        <AzesMobileNav
          config={nav}
          footerConfig={mobileFooterNav}
          tone={navColor}
          label={labels.primaryNav}
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          logo={slots.logo}
          top={slots.navTop}
          bottom={slots.navBottom}
        />
      )}
      <Box
        data-azes-layout-column=""
        sx={(t) => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          ...(lShell
            ? {
                ...navToneVars(t, navColor),
                height: '100dvh',
                maxHeight: '100dvh',
                overflow: 'hidden',
                // Join-radius wedge must match the rail, not paper alone.
                backgroundColor: 'var(--azes-nav-bg)',
                transition: t.transitions.create(['background-color'], { duration: 200 }),
              }
            : { minHeight: '100dvh' }),
          marginInlineStart: 'var(--azes-layout-nav-width)',
          isolation: 'isolate',
          transition: t.transitions.create(['margin'], {
            duration: t.transitions.duration.shorter,
          }),
        })}
      >
        {header}
        {lShell ? scoop : mainAndFooter}
      </Box>
      <AzesScrollToTop scrollTarget={lShell ? scoopEl : null} label={labels.scrollToTop} />
    </AzesLayoutVars>
  );
}
