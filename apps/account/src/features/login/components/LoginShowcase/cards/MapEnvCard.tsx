/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/cards/MapEnvCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-20
 * ║ Purpose: Decorative learning-path map + lesson-type pins
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';

import { LoginShowcaseCard } from '../LoginShowcaseCard.js';

export type MapEnvCardProps = {
  title: string;
  chips: [string, string, string];
  rotate?: number;
  depth?: number;
  width?: string;
};

export function MapEnvCard({ title, chips, rotate, depth, width }: MapEnvCardProps) {
  const theme = useTheme();
  const primary = theme.vars.palette.primary.main;
  const secondary = theme.vars.palette.secondary.main;
  const paper = theme.vars.palette.background.paper;
  const land = `color-mix(in srgb, ${primary} 8%, ${theme.vars.palette.background.default})`;
  const sea = `color-mix(in srgb, ${secondary} 24%, ${theme.vars.palette.info.main})`;
  const street = `color-mix(in srgb, ${theme.vars.palette.text.primary} 20%, transparent)`;

  return (
    <LoginShowcaseCard id="map" rotate={rotate} depth={depth} width={width}>
      <MuiBox
        component="svg"
        viewBox="0 0 240 260"
        aria-hidden
        sx={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '12 / 13' }}
      >
        <rect width="240" height="260" fill={land} />
        <path
          d="M0 160 C40 140, 70 190, 120 168 C160 150, 190 130, 240 148 L240 260 L0 260 Z"
          fill={sea}
          opacity="0.55"
        />
        <path
          d="M8 158 C48 136, 78 182, 118 162 C152 146, 186 124, 232 142"
          fill="none"
          stroke={`color-mix(in srgb, ${primary} 70%, ${theme.vars.palette.text.secondary})`}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line x1="40" y1="36" x2="40" y2="200" stroke={street} strokeWidth="1" />
        <line x1="100" y1="28" x2="100" y2="190" stroke={street} strokeWidth="1" />
        <line x1="160" y1="40" x2="160" y2="200" stroke={street} strokeWidth="1" />
        <line x1="200" y1="32" x2="200" y2="170" stroke={street} strokeWidth="1" />
        <line x1="20" y1="80" x2="220" y2="80" stroke={street} strokeWidth="1" />
        <line x1="24" y1="130" x2="216" y2="130" stroke={street} strokeWidth="1" />
        <rect
          x="52"
          y="52"
          width="28"
          height="18"
          rx="3"
          fill={`color-mix(in srgb, ${theme.vars.palette.success.main} 30%, transparent)`}
        />
        <rect
          x="168"
          y="96"
          width="32"
          height="20"
          rx="3"
          fill={`color-mix(in srgb, ${theme.vars.palette.success.main} 24%, transparent)`}
        />
        <circle
          cx="120"
          cy="110"
          r="28"
          fill="none"
          stroke={`color-mix(in srgb, ${primary} 35%, transparent)`}
          strokeWidth="2"
        />
        <circle cx="120" cy="110" r="7" fill={primary} />
        {/* lesson-type pins: Video / Quiz / Assignment / Course */}
        <g>
          <circle cx="64" cy="96" r="8" fill={paper} stroke={theme.vars.palette.info.main} />
          <text x="61" y="99" fontSize="8" fill={theme.vars.palette.info.main}>
            V
          </text>
          <circle cx="176" cy="72" r="8" fill={paper} stroke={theme.vars.palette.warning.main} />
          <text x="173" y="75" fontSize="8" fill={theme.vars.palette.warning.main}>
            Q
          </text>
          <circle cx="88" cy="148" r="8" fill={paper} stroke={secondary} />
          <text x="85" y="151" fontSize="8" fill={secondary}>
            A
          </text>
          <circle cx="168" cy="150" r="8" fill={paper} stroke={theme.vars.palette.success.main} />
          <text x="165" y="153" fontSize="8" fill={theme.vars.palette.success.main}>
            C
          </text>
        </g>
      </MuiBox>
      <MuiBox sx={{ px: 1.25, py: 1, display: 'grid', gap: 0.75 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
        <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {chips.map((chip) => (
            <MuiBox
              key={chip}
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: `${theme.shape.radiusSm}px`,
                bgcolor: `color-mix(in srgb, ${primary} 10%, ${paper})`,
                border: `1px solid ${theme.vars.palette.border.default}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {chip}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>
      </MuiBox>
    </LoginShowcaseCard>
  );
}
