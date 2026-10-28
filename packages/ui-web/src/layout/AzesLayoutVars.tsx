/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesLayoutVars.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Root that publishes --azes-layout-* CSS variables (Adobe L-shell chrome)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import type { Breakpoint, CSSObject, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import type { AzesNavLayout } from '../settings/types';

const px = (value: number) => `${value}px`;

export function layoutVarsSx(
  theme: Theme,
  { layoutQuery, navLayout }: { layoutQuery: Breakpoint; navLayout?: AzesNavLayout },
): CSSObject {
  const l = theme.azes.layout;
  // `horizontal` = mini rail + menus toolbar (dual chrome).
  const desktopNavWidth =
    navLayout === 'vertical'
      ? l.navVerticalWidth
      : navLayout === 'mini' || navLayout === 'horizontal'
        ? l.navMiniWidth
        : 0;
  const railChrome = navLayout === 'vertical' || navLayout === 'mini' || navLayout === 'horizontal';
  return {
    '--azes-layout-header-height': px(l.headerHeightMobile),
    '--azes-layout-nav-width': px(0),
    '--azes-layout-nav-mobile-width': px(l.navMobileWidth),
    '--azes-layout-nav-horizontal-height': px(0),
    '--azes-layout-content-max-width': px(l.contentMaxWidth),
    '--azes-layout-content-sidebar-width': px(l.contentSidebarWidth),
    '--azes-layout-page-padding': px(l.pagePaddingXs),
    '--azes-layout-chrome-gap': px(railChrome ? l.chromeGap : 0),
    '--azes-layout-chrome-radius': px(railChrome ? l.chromeRadius : 0),
    '--azes-layout-chrome-join': px(railChrome ? l.chromeJoinRadius : 0),
    [theme.breakpoints.up('md')]: { '--azes-layout-page-padding': px(l.pagePaddingMd) },
    [theme.breakpoints.up(layoutQuery)]: {
      '--azes-layout-header-height': px(l.headerHeightDesktop),
      '--azes-layout-nav-width': px(desktopNavWidth),
      '--azes-layout-nav-horizontal-height': px(
        navLayout === 'horizontal' ? l.navHorizontalHeight : 0,
      ),
      '--azes-layout-page-padding': px(l.pagePaddingLg),
    },
  };
}

export type AzesLayoutVarsProps = {
  layoutQuery?: Breakpoint;
  navLayout?: AzesNavLayout;
  children: ReactNode;
};

/** Publishes `--azes-layout-*` variables for its subtree. Every AZES layout renders one. */
export function AzesLayoutVars({ layoutQuery = 'lg', navLayout, children }: AzesLayoutVarsProps) {
  return (
    <Box
      data-azes-layout-root=""
      sx={(theme) => ({
        ...layoutVarsSx(theme, { layoutQuery, navLayout }),
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // L-shell chrome (sidebar + header) shares paper so the scoop reads as one frame.
        backgroundColor:
          navLayout === 'vertical' || navLayout === 'mini' || navLayout === 'horizontal'
            ? theme.vars.palette.background.paper
            : theme.vars.palette.background.default,
      })}
    >
      {children}
    </Box>
  );
}
