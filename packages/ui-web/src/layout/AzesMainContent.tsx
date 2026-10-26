/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesMainContent.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Main landmark — page padding + optional Fixed content column
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import type { MouseEvent, ReactNode } from 'react';

import type { AzesContainer } from '../settings/types';

export const AZES_MAIN_CONTENT_ID = 'main-content';

export type AzesMainContentProps = {
  container?: AzesContainer;
  disablePadding?: boolean;
  /**
   * When true (default), Fixed settings caps this inner column.
   * When false, main stays full-bleed (padding only) so pages can full-width
   * chrome/backgrounds and wrap copy/grids in `AzesContentRail`.
   */
  constrain?: boolean;
  /**
   * Opt-in: fill the scoop and keep overflow inside the page (list/grid shells).
   * Default stays content-sized so the scoop remains the L-shell scrollport
   * (required for global header autoHide).
   */
  fill?: boolean;
  children: ReactNode;
};

/**
 * Outer landmark stays full-bleed so the scoop scrollbar stays on the right edge.
 * Fixed + constrain caps the inner content column (maxWidth + centered).
 *
 * Important: do NOT put `minHeight: 0` + `overflowX: auto` on the default path —
 * CSS forces overflow-y to auto too, trapping scroll inside main and killing scoop
 * autoHide. Use `fill` only for pages that intentionally own their scrollport.
 */
export function AzesMainContent({
  container = 'fluid',
  disablePadding = false,
  constrain = true,
  fill = false,
  children,
}: AzesMainContentProps) {
  const capColumn = constrain && container === 'fixed';

  return (
    <Box
      component="main"
      id={AZES_MAIN_CONTENT_ID}
      tabIndex={-1}
      data-azes-constrain={constrain ? 'true' : 'false'}
      sx={(theme) => ({
        flex: fill ? 1 : undefined,
        width: '100%',
        minWidth: 0,
        minHeight: fill ? 0 : undefined,
        outline: 'none',
        display: fill ? 'flex' : undefined,
        flexDirection: fill ? 'column' : undefined,
        alignItems: 'stretch',
        overflow: fill ? 'hidden' : undefined,
        color: theme.vars.palette.text.primary,
      })}
    >
      <Box
        sx={(theme) => ({
          ...(fill
            ? {
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }
            : {
                // Do not set overflowX here — CSS couples a non-visible X axis to
                // overflow-y:auto, which creates a second scrollport inside main and
                // fights the L-shell scoop. Wide demos must contain themselves.
                minWidth: 0,
              }),
          width: '100%',
          maxWidth: capColumn ? theme.azes.layout.contentMaxWidth : 'none',
          marginInline: capColumn ? 'auto' : 0,
          paddingInline: disablePadding
            ? 0
            : { xs: theme.spacing(2), md: theme.spacing(3), lg: theme.spacing(4) },
          paddingBlock: disablePadding
            ? 0
            : { xs: theme.spacing(2), md: theme.spacing(3), lg: theme.spacing(4) },
          transition: theme.transitions.create(['max-width', 'padding'], {
            duration: 200,
          }),
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        })}
      >
        {children}
      </Box>
    </Box>
  );
}

export type AzesFooterProps = {
  children: ReactNode;
  container?: AzesContainer;
  /**
   * Marketing footers with full-bleed bands own their own rails/padding.
   * When true, children render edge-to-edge inside the footer landmark.
   */
  flush?: boolean;
};

/**
 * Footer chrome is always full-bleed (edge-to-edge rule/background).
 * Fixed/Fluid caps the inner content row unless `flush` (banded footers).
 */
export function AzesFooter({ children, container = 'fluid', flush = false }: AzesFooterProps) {
  const fixed = container === 'fixed';

  return (
    <Box
      component="footer"
      data-azes-footer=""
      data-azes-footer-flush={flush ? 'true' : 'false'}
      sx={(theme) => ({
        width: '100%',
        borderBlockStartWidth: flush ? 0 : 1,
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: theme.vars.palette.border.default,
        color: theme.vars.palette.text.secondary,
        ...theme.typography.body2,
      })}
    >
      {flush ? (
        children
      ) : (
        <Box
          sx={(theme) => ({
            width: '100%',
            maxWidth: fixed ? theme.azes.layout.contentMaxWidth : 'none',
            marginInline: fixed ? 'auto' : 0,
            paddingInline: { xs: theme.spacing(2), md: theme.spacing(3), lg: theme.spacing(4) },
            paddingBlock: theme.spacing(4),
            transition: theme.transitions.create(['max-width', 'padding'], { duration: 200 }),
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          })}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

export type AzesSkipLinkProps = { label: string };

/** Focuses `#main-content` without touching `location.hash` (safe with hash routers). */
export function AzesSkipLink({ label }: AzesSkipLinkProps) {
  return (
    <Box
      component="a"
      href={`#${AZES_MAIN_CONTENT_ID}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const main = document.getElementById(AZES_MAIN_CONTENT_ID);
        main?.focus({ preventScroll: true });
      }}
      sx={(theme) => ({
        position: 'fixed',
        insetBlockStart: theme.spacing(2),
        insetInlineStart: theme.spacing(2),
        zIndex: theme.zIndex.tooltip + 1,
        paddingInline: theme.spacing(4),
        paddingBlock: theme.spacing(2),
        borderRadius: `${theme.shape.radiusMd}px`,
        backgroundColor: theme.vars.palette.primary.main,
        color: theme.vars.palette.primary.contrastText,
        ...theme.typography.button,
        transform: 'translateY(-200%)',
        '&:focus-visible': { transform: 'none' },
      })}
    >
      {label}
    </Box>
  );
}
