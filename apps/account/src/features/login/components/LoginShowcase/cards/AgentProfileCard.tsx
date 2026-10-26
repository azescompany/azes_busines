/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/cards/AgentProfileCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Decorative abstract agent profile illustration
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';

import { LoginShowcaseCard } from '../LoginShowcaseCard.js';

export type AgentProfileCardProps = {
  roleLabel: string;
  verified: string;
  stats: [string, string, string];
  contact: string;
  message: string;
  rotate?: number;
  depth?: number;
  width?: string;
};

export function AgentProfileCard({
  roleLabel,
  verified,
  stats,
  contact,
  message,
  rotate,
  depth,
  width,
}: AgentProfileCardProps) {
  const theme = useTheme();
  const primary = theme.vars.palette.primary.main;
  const paper = theme.vars.palette.background.paper;

  return (
    <LoginShowcaseCard id="agent" rotate={rotate} depth={depth} width={width}>
      <MuiBox sx={{ p: 1.5, display: 'grid', gap: 1.25, justifyItems: 'center' }}>
        <MuiBox
          component="svg"
          viewBox="0 0 120 120"
          aria-hidden
          sx={{ width: theme.spacing(10), height: theme.spacing(10), display: 'block' }}
        >
          <circle cx="60" cy="60" r="58" fill={`color-mix(in srgb, ${primary} 14%, ${paper})`} />
          <circle cx="60" cy="46" r="18" fill={`color-mix(in srgb, ${primary} 45%, ${paper})`} />
          <path
            d="M24 98 C28 72, 92 72, 96 98"
            fill={`color-mix(in srgb, ${primary} 40%, ${paper})`}
          />
          <circle cx="92" cy="28" r="10" fill={theme.vars.palette.success.main} />
          <path
            d="M87 28 L90 31 L97 24"
            fill="none"
            stroke={paper}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </MuiBox>
        <MuiBox
          sx={{
            width: '70%',
            height: theme.spacing(1.25),
            borderRadius: `${theme.shape.radiusSm}px`,
            bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 16%, ${paper})`,
          }}
        />
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {roleLabel}
        </Typography>
        <MuiBox sx={{ display: 'flex', gap: 0.35 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <MuiBox
              key={i}
              sx={{
                width: theme.spacing(1.25),
                height: theme.spacing(1.25),
                clipPath:
                  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                bgcolor:
                  i < 4 ? theme.vars.palette.warning.main : theme.vars.palette.border.default,
              }}
            />
          ))}
        </MuiBox>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {verified}
        </Typography>
        <MuiBox
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75, width: '100%' }}
        >
          {stats.map((s) => (
            <MuiBox
              key={s}
              sx={{
                textAlign: 'center',
                py: 0.5,
                borderRadius: `${theme.shape.radiusSm}px`,
                bgcolor: `color-mix(in srgb, ${primary} 8%, ${paper})`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {s}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>
        <MuiBox sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, width: '100%' }}>
          {[contact, message].map((label, i) => (
            <MuiBox
              key={label}
              sx={{
                py: 0.75,
                textAlign: 'center',
                borderRadius: `${theme.shape.radiusMd}px`,
                bgcolor: i === 0 ? primary : `color-mix(in srgb, ${primary} 12%, ${paper})`,
                border: `1px solid ${i === 0 ? primary : theme.vars.palette.border.default}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: i === 0 ? theme.vars.palette.primary.contrastText : 'text.primary',
                }}
              >
                {label}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>
      </MuiBox>
    </LoginShowcaseCard>
  );
}
