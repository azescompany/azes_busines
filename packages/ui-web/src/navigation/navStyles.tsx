/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/navStyles.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-14
 * ║ Purpose: Nav surface CSS vars (no inherited color on layout ancestors)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import type { AzesNavBadge, AzesNavItem } from './types';

export type AzesNavTone = 'integrated' | 'contrast';

/**
 * Menus toolbar wash: soft black → primary bloom → black.
 * Extra stops avoid a hard black/primary cut; center keeps brand hue visible.
 */
export function navToolbarGradient(theme: Theme): string {
  const black = theme.vars.palette.common.black;
  const primary = theme.vars.palette.primary.main;
  // Soft ramp: black edges, richer primary in the middle (still dark enough for white type).
  const edge = `color-mix(in srgb, ${primary} 22%, ${black})`;
  const mid = `color-mix(in srgb, ${primary} 52%, ${black})`;
  const center = `color-mix(in srgb, ${primary} 68%, ${black})`;
  return `linear-gradient(
    90deg,
    ${black} 0%,
    ${edge} 16%,
    ${mid} 34%,
    ${center} 50%,
    ${mid} 66%,
    ${edge} 84%,
    ${black} 100%
  )`;
}

/**
 * Shared navigation surface tokens for sidebar + header chrome.
 * Containers set them once; item styles consume the CSS variables.
 */
export function navToneVars(theme: Theme, tone: AzesNavTone): CSSObject {
  const primary = theme.vars.palette.primary.main;
  const white = theme.vars.palette.common.white;
  const black = theme.vars.palette.common.black;
  const transition = theme.transitions.create(
    ['background-color', 'color', 'border-color', 'box-shadow'],
    { duration: 200 },
  );

  if (tone === 'contrast') {
    // Contrast = dark primary-tinted chrome + light type (both schemes).
    // Never lift to pale paper in dark mode — that made captions unreadable.
    // CSS vars only — do NOT set `color` here. Layout column wraps the scoop;
    // inherited nav ink made light-mode body text white-on-white across apps.
    return {
      transition,
      '--azes-nav-bg': `color-mix(in srgb, ${primary} 32%, ${black})`,
      '--azes-nav-border': 'transparent',
      '--azes-nav-text': `color-mix(in srgb, ${white} 96%, transparent)`,
      '--azes-nav-text-strong': white,
      '--azes-nav-subheader': `color-mix(in srgb, ${white} 72%, transparent)`,
      '--azes-nav-hover': `color-mix(in srgb, ${white} 12%, transparent)`,
      '--azes-nav-active-bg': `color-mix(in srgb, ${primary} 45%, transparent)`,
      '--azes-nav-active-text': white,
      '--azes-nav-active-underline': white,
      ...theme.applyStyles('dark', {
        '--azes-nav-bg': `color-mix(in srgb, ${primary} 26%, ${black})`,
        '--azes-nav-border': 'transparent',
        '--azes-nav-text': `color-mix(in srgb, ${white} 96%, transparent)`,
        '--azes-nav-text-strong': white,
        '--azes-nav-subheader': `color-mix(in srgb, ${white} 72%, transparent)`,
        '--azes-nav-hover': `color-mix(in srgb, ${white} 12%, transparent)`,
        '--azes-nav-active-bg': `color-mix(in srgb, ${primary} 40%, transparent)`,
        '--azes-nav-active-text': white,
        '--azes-nav-active-underline': white,
      }),
    };
  }

  return {
    transition,
    '--azes-nav-bg': theme.vars.palette.background.paper,
    '--azes-nav-border': theme.vars.palette.divider,
    '--azes-nav-text': theme.vars.palette.text.secondary,
    '--azes-nav-text-strong': theme.vars.palette.text.primary,
    '--azes-nav-subheader': theme.vars.palette.text.muted,
    '--azes-nav-hover': theme.vars.palette.action.hover,
    '--azes-nav-active-bg': `color-mix(in srgb, ${primary} 10%, transparent)`,
    '--azes-nav-active-text': theme.vars.palette.primary.main,
    '--azes-nav-active-underline': theme.vars.palette.primary.main,
  };
}

export function navItemHeight(theme: Theme, depth: number): number {
  const { component, density } = theme.azes;
  return depth === 1 ? component.navItemHeight[density] : component.navSubItemHeight[density];
}

export function navItemSx(
  theme: Theme,
  { depth, active, selected }: { depth: number; active: boolean; selected: boolean },
): CSSObject {
  return {
    position: 'relative',
    minHeight: navItemHeight(theme, depth),
    minWidth: 0,
    borderRadius: `${theme.shape.radiusMd}px`,
    marginBlock: theme.spacing(0.5),
    paddingInlineStart: theme.spacing(3 + (depth - 1) * 4),
    paddingInlineEnd: theme.spacing(2),
    gap: theme.spacing(3),
    color: active || selected ? 'var(--azes-nav-text-strong)' : 'var(--azes-nav-text)',
    fontWeight:
      selected || active ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular,
    transition: theme.transitions.create(['background-color', 'color', 'box-shadow'], {
      duration: 200,
    }),
    '&:hover': { backgroundColor: 'var(--azes-nav-hover)' },
    // Active trail (parent open / current branch) — soft wash without full selected chrome.
    ...(active &&
      !selected && {
        backgroundColor: 'color-mix(in srgb, var(--azes-nav-active-bg) 55%, transparent)',
      }),
    // Current page — accent bar + filled wash.
    ...(selected && {
      '&.Mui-selected, &.Mui-selected:hover': {
        backgroundColor: 'var(--azes-nav-active-bg)',
        color: 'var(--azes-nav-active-text)',
        boxShadow: `inset 3px 0 0 var(--azes-nav-active-underline, var(--azes-nav-active-text))`,
      },
    }),
  };
}

export const navSubheaderSx = (theme: Theme): CSSObject => ({
  ...theme.typography.overline,
  lineHeight: 2,
  backgroundColor: 'transparent',
  color: 'var(--azes-nav-subheader)',
  paddingInline: theme.spacing(3),
  paddingBlock: theme.spacing(2, 1),
});

export function NavIcon({
  item,
  fallbackLetter = false,
  /** Override default `component.navIconSize` (e.g. fine horizontal toolbar). */
  size,
}: {
  item: AzesNavItem;
  fallbackLetter?: boolean;
  size?: number | string;
}) {
  if (item.icon) {
    return (
      <Box
        component="span"
        aria-hidden
        sx={(theme) => ({
          display: 'inline-flex',
          flexShrink: 0,
          fontSize: size ?? theme.azes.component.navIconSize,
          lineHeight: 1,
          '& svg': { fontSize: 'inherit' },
        })}
      >
        {item.icon}
      </Box>
    );
  }
  if (!fallbackLetter) return null;
  return (
    <Box
      component="span"
      aria-hidden
      sx={(theme) => ({
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
        width: theme.azes.component.navIconSize + 6,
        height: theme.azes.component.navIconSize + 6,
        borderRadius: `${theme.shape.radiusSm}px`,
        border: 1,
        borderColor: 'currentColor',
        ...theme.typography.caption,
        fontWeight: theme.typography.fontWeightMedium,
      })}
    >
      {item.title.charAt(0).toUpperCase()}
    </Box>
  );
}

export function NavBadge({ badge }: { badge?: AzesNavBadge }): ReactNode {
  if (!badge) return null;
  return (
    <Chip
      size="small"
      label={badge.content}
      color={badge.color ?? 'primary'}
      sx={{ height: 20, fontSize: '0.6875rem', flexShrink: 0 }}
    />
  );
}
