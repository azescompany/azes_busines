/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/loading/CaspianKeyLoader.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Fullscreen Caspian Key loader (boot + admin handoff)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { LinearProgress, MuiBox, Typography, useTheme } from '@azes/ui-web';
import { getBackdropSx } from '@azes/ui-web/backdrop';

import { CaspianKeyLogo } from '../branding/CaspianKeyLogo.js';

export type CaspianKeyLoaderProps = {
  brandLabel?: string;
  label?: string;
  subtitle?: string;
};

/** Fullscreen branded loader for account boot and account→admin handoff. */
export function CaspianKeyLoader({
  brandLabel = 'Caspian Key',
  label = 'Loading…',
  subtitle,
}: CaspianKeyLoaderProps) {
  const theme = useTheme();
  const primary = theme.vars.palette.primary.main;
  const glass = getBackdropSx(theme) as Record<string, unknown>;
  const blur = theme.azes.backdrop.blur;
  const loaderBlur = `blur(${Math.round(blur * 1.75)}px) saturate(${theme.azes.backdrop.saturate})`;

  return (
    <MuiBox
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`${brandLabel}. ${label}`}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 3,
        ...glass,
        backdropFilter: loaderBlur,
        WebkitBackdropFilter: loaderBlur,
        backgroundImage: `radial-gradient(
          ellipse 80% 60% at 50% 35%,
          color-mix(in srgb, ${primary} 22%, transparent),
          transparent 72%
        )`,
      }}
    >
      <CaspianKeyLogo label={brandLabel} size={theme.spacing(36)} />
      <MuiBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          textAlign: 'center',
          maxWidth: theme.spacing(40),
        }}
      >
        <Typography
          component="p"
          variant="overline"
          sx={{
            m: 0,
            color: theme.vars.palette.primary.main,
            fontWeight: theme.typography.fontWeightBold,
          }}
        >
          {brandLabel}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            m: 0,
            color: theme.vars.palette.text.primary,
            fontWeight: theme.typography.fontWeightMedium,
          }}
        >
          {label}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ m: 0 }}>
            {subtitle}
          </Typography>
        ) : null}
      </MuiBox>
      <LinearProgress
        aria-hidden
        sx={{
          width: '100%',
          maxWidth: theme.spacing(28),
          height: theme.spacing(0.5),
          borderRadius: theme.azesRadius.full,
          backgroundColor: `color-mix(in srgb, ${primary} 12%, ${theme.vars.palette.background.paper})`,
          '& .MuiLinearProgress-bar': {
            borderRadius: theme.azesRadius.full,
            backgroundImage: `linear-gradient(90deg, ${primary}, ${theme.vars.palette.secondary.main})`,
          },
        }}
      />
    </MuiBox>
  );
}
