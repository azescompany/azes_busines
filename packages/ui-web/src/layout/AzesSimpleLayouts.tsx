/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesSimpleLayouts.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Main (marketing/content) and auth layouts without a side navigation
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import type { ReactNode } from 'react';

import { useOptionalAzesSettings } from '../settings/AzesSettingsProvider';
import type { AzesContainer } from '../settings/types';
import { AzesHeader } from './AzesHeader';
import { AzesLayoutVars } from './AzesLayoutVars';
import { AzesFooter, AzesMainContent, AzesSkipLink } from './AzesMainContent';

export type AzesMainLayoutProps = {
  container?: AzesContainer;
  slots?: { logo?: ReactNode; headerCenter?: ReactNode; headerEnd?: ReactNode; footer?: ReactNode };
  skipToContentLabel?: string;
  children: ReactNode;
};

export function AzesMainLayout({
  container: containerProp,
  slots = {},
  skipToContentLabel = 'Skip to content',
  children,
}: AzesMainLayoutProps) {
  const settingsContainer = useOptionalAzesSettings((s) => s.container);
  const container = containerProp ?? settingsContainer ?? 'fixed';
  return (
    <AzesLayoutVars>
      <AzesSkipLink label={skipToContentLabel} />
      <AzesHeader start={slots.logo} center={slots.headerCenter} end={slots.headerEnd} />
      <AzesMainContent container={container}>{children}</AzesMainContent>
      {slots.footer ? <AzesFooter>{slots.footer}</AzesFooter> : null}
    </AzesLayoutVars>
  );
}

export type AzesAuthLayoutSlots = {
  logo?: ReactNode;
  headerEnd?: ReactNode;
  footer?: ReactNode;
  /** Content for the split aside (panel text or hero overlay copy). */
  aside?: ReactNode;
  /** Mark above the auth card (logo + product name). */
  brand?: ReactNode;
  /** Absolute layer behind aside content (hero image, patterns). */
  asideBackdrop?: ReactNode;
  /** Absolute layer behind the form column (corner patterns). */
  formBackdrop?: ReactNode;
};

export type AzesAuthLayoutProps = {
  slots?: AzesAuthLayoutSlots;
  skipToContentLabel?: string;
  /** Hide the sticky header (product auth pages that put brand above the card). */
  hideHeader?: boolean;
  /**
   * `panel` — padded paper aside (showcase default).
   * `hero` — full-bleed media aside; content sits over `asideBackdrop`.
   */
  asideVariant?: 'panel' | 'hero';
  children: ReactNode;
};

/** Centered card. With `slots.aside`, splits into aside + form from `md` up. */
export function AzesAuthLayout({
  slots = {},
  skipToContentLabel = 'Skip to content',
  hideHeader = false,
  asideVariant = 'panel',
  children,
}: AzesAuthLayoutProps) {
  const hasAside = Boolean(slots.aside || slots.asideBackdrop);
  const isHero = asideVariant === 'hero' && hasAside;
  const showHeader = !hideHeader && Boolean(slots.logo || slots.headerEnd);

  return (
    <AzesLayoutVars>
      <AzesSkipLink label={skipToContentLabel} />
      {showHeader ? (
        <AzesHeader start={slots.logo} end={slots.headerEnd} elevateOnScroll={false} />
      ) : null}
      <Box
        sx={(theme) => ({
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr',
          minHeight: showHeader ? 'calc(100dvh - var(--azes-layout-header-height))' : '100dvh',
          [theme.breakpoints.up('md')]: hasAside ? { gridTemplateColumns: '1fr 1fr' } : {},
        })}
      >
        {hasAside ? (
          <Box
            aria-hidden={isHero ? undefined : true}
            sx={(theme) => ({
              position: 'relative',
              display: 'none',
              overflow: 'hidden',
              [theme.breakpoints.up('md')]: { display: 'flex' },
              ...(isHero
                ? {
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    padding: 'var(--azes-layout-page-padding)',
                    backgroundColor: theme.vars.palette.grey[200],
                  }
                : {
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--azes-layout-page-padding)',
                    backgroundColor: theme.vars.palette.background.paper,
                    borderInlineEndWidth: 1,
                    borderInlineEndStyle: 'solid',
                    borderInlineEndColor: theme.vars.palette.border.default,
                  }),
            })}
          >
            {slots.asideBackdrop ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                {slots.asideBackdrop}
              </Box>
            ) : null}
            {slots.aside ? (
              <Box sx={{ position: 'relative', zIndex: 1, maxWidth: '36rem' }}>{slots.aside}</Box>
            ) : null}
          </Box>
        ) : null}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          {slots.formBackdrop ? (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'hidden',
              }}
            >
              {slots.formBackdrop}
            </Box>
          ) : null}
          <AzesMainContent>
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: (theme) => theme.azes.layout.authCardWidth,
                marginInline: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: (theme) => theme.spacing(6),
              }}
            >
              {slots.brand ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {slots.brand}
                </Box>
              ) : null}
              <Paper
                variant="outlined"
                sx={(theme) => ({
                  width: '100%',
                  padding: theme.spacing(8),
                  [theme.breakpoints.down('sm')]: { padding: theme.spacing(5) },
                  boxShadow: theme.azes.customShadows.card,
                  borderRadius: `${theme.shape.radiusLg}px`,
                })}
              >
                {children}
              </Paper>
            </Box>
          </AzesMainContent>
        </Box>
      </Box>
      {slots.footer ? <AzesFooter>{slots.footer}</AzesFooter> : null}
    </AzesLayoutVars>
  );
}
