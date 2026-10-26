/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/cards/ListingsBoardCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Decorative listings board illustration (2×2 tiles)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';

import { LoginShowcaseCard } from '../LoginShowcaseCard.js';

export type ListingsBoardCardProps = {
  title: string;
  chips: [string, string];
  prices: [string, string, string, string];
  rotate?: number;
  depth?: number;
  width?: string;
};

export function ListingsBoardCard({
  title,
  chips,
  prices,
  rotate,
  depth,
  width,
}: ListingsBoardCardProps) {
  const theme = useTheme();
  const primary = theme.vars.palette.primary.main;
  const secondary = theme.vars.palette.secondary.main;
  const paper = theme.vars.palette.background.paper;
  const ink = theme.vars.palette.text.primary;

  return (
    <LoginShowcaseCard id="listings" rotate={rotate} depth={depth} width={width}>
      <MuiBox sx={{ p: 1.25 }}>
        <MuiBox sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          {(['error', 'warning', 'success'] as const).map((tone) => (
            <MuiBox
              key={tone}
              sx={{
                width: theme.spacing(1),
                height: theme.spacing(1),
                borderRadius: '50%',
                bgcolor: theme.vars.palette[tone].main,
                opacity: 0.85,
              }}
            />
          ))}
          <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
        </MuiBox>
        <MuiBox sx={{ display: 'flex', gap: 0.75, mb: 1.25 }}>
          {chips.map((chip) => (
            <MuiBox
              key={chip}
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: `${theme.shape.radiusSm}px`,
                bgcolor: `color-mix(in srgb, ${primary} 12%, ${paper})`,
                border: `1px solid color-mix(in srgb, ${primary} 22%, ${theme.vars.palette.border.default})`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {chip}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>
        <MuiBox
          component="svg"
          viewBox="0 0 320 200"
          aria-hidden
          sx={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '16 / 10' }}
        >
          {[
            { x: 8, y: 8, p: primary, price: prices[0] },
            { x: 168, y: 8, p: secondary, price: prices[1] },
            { x: 8, y: 104, p: secondary, price: prices[2] },
            { x: 168, y: 104, p: primary, price: prices[3] },
          ].map((tile) => (
            <g key={`${tile.x}-${tile.y}`}>
              <rect
                x={tile.x}
                y={tile.y}
                width="144"
                height="88"
                rx="8"
                fill={`color-mix(in srgb, ${tile.p} 16%, ${paper})`}
                stroke={theme.vars.palette.border.default}
              />
              <rect
                x={tile.x + 10}
                y={tile.y + 10}
                width="124"
                height="42"
                rx="4"
                fill={`color-mix(in srgb, ${tile.p} 28%, ${paper})`}
              />
              <rect
                x={tile.x + 22}
                y={tile.y + 22}
                width="28"
                height="22"
                rx="2"
                fill={`color-mix(in srgb, ${ink} 18%, ${tile.p})`}
              />
              <rect
                x={tile.x + 56}
                y={tile.y + 18}
                width="36"
                height="30"
                rx="2"
                fill={`color-mix(in srgb, ${ink} 22%, ${tile.p})`}
              />
              <circle
                cx={tile.x + 126}
                cy={tile.y + 20}
                r="5"
                fill={theme.vars.palette.error.main}
                opacity="0.7"
              />
              <circle
                cx={tile.x + 18}
                cy={tile.y + 68}
                r="3.5"
                fill={theme.vars.palette.success.main}
              />
              <text
                x={tile.x + 28}
                y={tile.y + 72}
                fill={ink}
                fontSize="11"
                fontWeight="700"
                fontFamily="inherit"
              >
                {tile.price}
              </text>
            </g>
          ))}
        </MuiBox>
      </MuiBox>
    </LoginShowcaseCard>
  );
}
