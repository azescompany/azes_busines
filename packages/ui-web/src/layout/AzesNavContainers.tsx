/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesNavContainers.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-14
 * ║ Purpose: Vertical/mini/horizontal/mobile nav — brand, scroll menus, sticky footer
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import AppsIcon from '@mui/icons-material/Apps';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { useTheme, type Breakpoint } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { AzesNavHorizontalBar } from '../navigation/AzesNavHorizontalBar';
import { AzesNavList } from '../navigation/AzesNavList';
import { AzesNavMiniList } from '../navigation/AzesNavMiniList';
import { navToneVars, navToolbarGradient, type AzesNavTone } from '../navigation/navStyles';
import type { AzesNavConfig } from '../navigation/types';
import { AzesSkeletonGroup } from '../skeleton/AzesSkeletonGroup/AzesSkeletonGroup';
import { appsTriggerSx } from './appsTriggerSx';
import { chromeInlinePadding } from './chromeMetrics';

/**
 * Indeterminate menus pending state — not a fake item count.
 * Response length is unknown; a Caspian-wave ribbon reads as “loading” without
 * implying how many top-level menus will arrive.
 */
function HorizontalMenusSkeleton() {
  const theme = useTheme();
  const wash = theme.vars.palette.common.white;

  return (
    <AzesSkeletonGroup
      loading
      variant="wave"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: 'var(--azes-layout-nav-horizontal-height)',
        backgroundImage: `linear-gradient(
          90deg,
          transparent 0%,
          color-mix(in srgb, ${wash} 8%, transparent) 50%,
          transparent 100%
        )`,
      }}
    >
      <Box
        data-azes-menus-skeleton=""
        aria-hidden
        sx={{
          position: 'relative',
          zIndex: 0,
          width: 'min(22rem, 48%)',
          maxWidth: '100%',
          height: 10,
          borderRadius: theme.shape.radiusFull,
          backgroundColor: `color-mix(in srgb, ${wash} 16%, transparent)`,
          boxShadow: `0 0 28px color-mix(in srgb, ${wash} 10%, transparent)`,
        }}
      />
    </AzesSkeletonGroup>
  );
}

function NavBrandBlock({ logo, mini }: { logo?: ReactNode; mini?: boolean }) {
  if (!logo) return null;
  return (
    <Box data-azes-nav-brand="" sx={{ flexShrink: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: mini ? 'center' : 'flex-start',
          minHeight: 'var(--azes-layout-header-height)',
          height: 'var(--azes-layout-header-height)',
          paddingInline: mini ? 1 : 2.5,
          paddingBlock: 1,
          boxSizing: 'border-box',
          backgroundColor: 'var(--azes-nav-bg)',
        }}
      >
        {logo}
      </Box>
      <Divider
        sx={{
          borderColor: 'var(--azes-nav-border)',
          opacity: 0.85,
        }}
      />
    </Box>
  );
}

function NavFooterBlock({
  footerConfig,
  mini,
  bottom,
  onNavigate,
}: {
  footerConfig?: AzesNavConfig;
  mini?: boolean;
  bottom?: ReactNode;
  onNavigate?: () => void;
}) {
  const hasFooterNav = Boolean(footerConfig?.some((g) => g.items.length > 0));
  if (!hasFooterNav && !bottom) return null;

  return (
    <Box
      data-azes-nav-footer=""
      sx={{
        flexShrink: 0,
        borderTop: '1px solid',
        borderColor: 'var(--azes-nav-border)',
        backgroundColor: 'var(--azes-nav-bg)',
        mt: 'auto',
      }}
    >
      {hasFooterNav && footerConfig ? (
        mini ? (
          <AzesNavMiniList config={footerConfig} />
        ) : (
          <AzesNavList config={footerConfig} onNavigate={onNavigate} dense />
        )
      ) : null}
      {bottom ? (
        <Box sx={{ px: 2, pb: hasFooterNav ? 2 : 3, pt: hasFooterNav ? 0 : 2 }}>{bottom}</Box>
      ) : null}
    </Box>
  );
}

type BaseNavProps = {
  config: AzesNavConfig;
  tone?: AzesNavTone;
  /** Accessible name of the `<nav>` landmark. */
  label: string;
  layoutQuery?: Breakpoint;
};

export type AzesVerticalNavProps = BaseNavProps & {
  mini?: boolean;
  logo?: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  /** Pinned footer nav (Docs / AI) — does not scroll with menus. */
  footerConfig?: AzesNavConfig;
  /** Renders the collapse/expand button when provided. */
  onToggleMini?: () => void;
  toggleLabel?: string;
  /**
   * `fixed` (default): viewport-fixed L-shell rail.
   * `docked`: in-flow column under a full-bleed top chrome (dual horizontal+mini).
   */
  placement?: 'fixed' | 'docked';
  /** Hide the brand/logo row (logo lives in the top chrome instead). */
  hideBrand?: boolean;
};

export function AzesVerticalNav({
  config,
  tone = 'integrated',
  label,
  layoutQuery = 'lg',
  mini = false,
  logo,
  top,
  bottom,
  footerConfig,
  onToggleMini,
  toggleLabel,
  placement = 'fixed',
  hideBrand = false,
}: AzesVerticalNavProps) {
  const docked = placement === 'docked';
  const hasScrollMenus = config.some((g) => g.items.length > 0);

  return (
    <Box
      component="nav"
      aria-label={label}
      data-azes-rail=""
      data-azes-rail-placement={placement}
      sx={(theme) => ({
        ...navToneVars(theme, tone),
        // Chrome ink — set on the rail only (not via layout-column inheritance).
        color: 'var(--azes-nav-text)',
        display: 'none',
        [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
        flexDirection: 'column',
        ...(docked
          ? {
              position: 'relative',
              flexShrink: 0,
              alignSelf: 'stretch',
              height: 'auto',
              minHeight: 0,
            }
          : {
              position: 'fixed',
              insetBlock: 0,
              insetInlineStart: 0,
              zIndex: theme.zIndex.appBar + 1,
            }),
        width: 'var(--azes-layout-nav-width)',
        backgroundColor: 'var(--azes-nav-bg)',
        overflow: 'hidden',
        transition: theme.transitions.create(['width'], {
          duration: theme.transitions.duration.shorter,
        }),
      })}
    >
      {hideBrand ? null : <NavBrandBlock logo={logo} mini={mini} />}
      {onToggleMini ? (
        <IconButton
          size="small"
          aria-label={toggleLabel}
          onClick={onToggleMini}
          sx={(theme) => {
            const edge = 'translate(50%, -50%)';
            const edgeRtl = 'translate(-50%, -50%) scaleX(-1)';
            return {
              position: 'absolute',
              insetBlockStart: hideBrand
                ? theme.spacing(3)
                : `calc(var(--azes-layout-header-height) / 2)`,
              insetInlineEnd: 0,
              transform: edge,
              zIndex: 1,
              backgroundColor: theme.vars.palette.background.paper,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.vars.palette.border.default,
              '&:hover, &:active, &:focus, &.Mui-focusVisible': {
                transform: edge,
                backgroundColor: theme.vars.palette.background.paper,
              },
              '[dir="rtl"] &': {
                transform: edgeRtl,
                '&:hover, &:active, &:focus, &.Mui-focusVisible': {
                  transform: edgeRtl,
                },
              },
            };
          }}
        >
          {mini ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      ) : null}
      {top}
      <Box
        data-azes-nav-menus=""
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: hasScrollMenus ? 'auto' : 'hidden',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          backgroundColor: 'var(--azes-nav-bg)',
          paddingBlockStart: hasScrollMenus ? 1 : 0,
        }}
      >
        {hasScrollMenus ? (
          mini ? (
            <AzesNavMiniList config={config} />
          ) : (
            <AzesNavList config={config} />
          )
        ) : null}
      </Box>
      <NavFooterBlock footerConfig={footerConfig} mini={mini} bottom={bottom} />
    </Box>
  );
}

export type AzesHorizontalNavProps = BaseNavProps & {
  /** Called when the Apps control collapses the toolbar into the header. */
  onHideMenus?: () => void;
  hideMenusLabel?: string;
  prevMenusLabel?: string;
  nextMenusLabel?: string;
  menusId?: string;
  /** Indeterminate ribbon skeleton until menus resolve (no fake item count). */
  loading?: boolean;
};

/** Navigation surface toolbar; Apps centered over the mini-rail column; Adobe-style menus. */
export function AzesHorizontalNav({
  config,
  label,
  layoutQuery = 'lg',
  tone = 'integrated',
  onHideMenus,
  hideMenusLabel = 'Hide menus',
  prevMenusLabel = 'Previous menus',
  nextMenusLabel = 'Next menus',
  menusId,
  loading = false,
}: AzesHorizontalNavProps) {
  const resolvedMenusId = menusId ?? `${label.replace(/\s+/g, '-').toLowerCase()}-menus`;

  return (
    <Box
      component="nav"
      aria-label={label}
      id={resolvedMenusId}
      sx={(theme) => ({
        ...navToneVars(theme, tone),
        '--azes-nav-text': theme.vars.palette.common.white,
        '--azes-nav-text-strong': theme.vars.palette.common.white,
        '--azes-nav-hover': `color-mix(in srgb, ${theme.vars.palette.common.white} 14%, transparent)`,
        '--azes-nav-active-text': theme.vars.palette.common.white,
        '--azes-nav-active-underline': theme.vars.palette.common.white,
        display: 'none',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'grid',
          gridTemplateColumns:
            'var(--azes-layout-nav-width) minmax(0, 1fr) var(--azes-layout-nav-width)',
          alignItems: 'center',
        },
        minHeight: 'var(--azes-layout-nav-horizontal-height)',
        height: 'var(--azes-layout-nav-horizontal-height)',
        paddingInline: 0,
        paddingBlock: 0,
        boxSizing: 'border-box',
        position: 'relative',
        isolation: 'isolate',
        // Do not clip the menus strip scrollbar (was `hidden` → hover scroll invisible).
        overflow: 'visible',
        backgroundColor: theme.vars.palette.common.black,
        backgroundImage: navToolbarGradient(theme),
        color: 'var(--azes-nav-text-strong)',
        transition: theme.transitions.create(['background-color', 'background-image', 'color'], {
          duration: 200,
        }),
      })}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {onHideMenus ? (
          <IconButton
            aria-label={hideMenusLabel}
            aria-expanded
            aria-controls={resolvedMenusId}
            onClick={onHideMenus}
            sx={(theme) => ({
              ...appsTriggerSx(theme, 'toolbar'),
              color: 'var(--azes-nav-text-strong)',
            })}
          >
            <AppsIcon />
          </IconButton>
        ) : null}
      </Box>
      <Box
        sx={(theme) => ({
          minWidth: 0,
          maxWidth: '100%',
          display: 'flex',
          justifyContent: 'stretch',
          justifySelf: 'stretch',
          alignSelf: 'stretch',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          px: chromeInlinePadding(theme),
        })}
      >
        {loading ? (
          <HorizontalMenusSkeleton />
        ) : (
          <AzesNavHorizontalBar
            config={config}
            prevMenusLabel={prevMenusLabel}
            nextMenusLabel={nextMenusLabel}
          />
        )}
      </Box>
      <Box aria-hidden sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

export type AzesMobileNavProps = BaseNavProps & {
  open: boolean;
  onClose: () => void;
  logo?: ReactNode;
  top?: ReactNode;
  bottom?: ReactNode;
  /** Pinned footer nav (Docs / AI) — does not scroll with menus. */
  footerConfig?: AzesNavConfig;
};

export function AzesMobileNav({
  config,
  tone = 'integrated',
  label,
  open,
  onClose,
  logo,
  top,
  bottom,
  footerConfig,
}: AzesMobileNavProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: (theme) => ({
            ...navToneVars(theme, tone),
            color: 'var(--azes-nav-text)',
            width: 'var(--azes-layout-nav-mobile-width)',
            maxWidth: '86vw',
            backgroundColor: 'var(--azes-nav-bg)',
            backgroundImage: 'none',
          }),
        },
      }}
    >
      <Box
        component="nav"
        aria-label={label}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      >
        <NavBrandBlock logo={logo} />
        {top}
        <Box
          data-azes-nav-menus=""
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
          }}
        >
          <AzesNavList config={config} onNavigate={onClose} />
        </Box>
        <NavFooterBlock footerConfig={footerConfig} bottom={bottom} onNavigate={onClose} />
      </Box>
    </Drawer>
  );
}
