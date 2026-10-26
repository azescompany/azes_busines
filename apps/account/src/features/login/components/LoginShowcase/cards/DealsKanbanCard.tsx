/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/cards/DealsKanbanCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Decorative deals kanban illustration
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';

import { LoginShowcaseCard } from '../LoginShowcaseCard.js';

export type DealsKanbanCardProps = {
  columns: [string, string, string];
  prices: [string, string, string, string, string];
  rotate?: number;
  depth?: number;
  width?: string;
};

export function DealsKanbanCard({ columns, prices, rotate, depth, width }: DealsKanbanCardProps) {
  const theme = useTheme();
  const primary = theme.vars.palette.primary.main;
  const secondary = theme.vars.palette.secondary.main;
  const paper = theme.vars.palette.background.paper;
  const counts = [2, 3, 1] as const;

  return (
    <LoginShowcaseCard id="deals" rotate={rotate} depth={depth} width={width}>
      <MuiBox
        sx={{
          p: 1.25,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0.75,
          minHeight: theme.spacing(22),
        }}
      >
        {columns.map((col, colIndex) => (
          <MuiBox
            key={col}
            sx={{
              p: 0.75,
              borderRadius: `${theme.shape.radiusMd}px`,
              bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 4%, ${paper})`,
              border: `1px solid ${theme.vars.palette.border.default}`,
              display: 'grid',
              gap: 0.6,
              alignContent: 'start',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {col}
            </Typography>
            {Array.from({ length: counts[colIndex] ?? 1 }).map((_, cardIndex) => {
              const price = prices[Math.min(colIndex + cardIndex, prices.length - 1)] ?? prices[0];
              const dragging = colIndex === 1 && cardIndex === 1;
              return (
                <MuiBox
                  key={`${col}-${cardIndex}`}
                  sx={{
                    p: 0.75,
                    borderRadius: `${theme.shape.radiusSm}px`,
                    bgcolor: paper,
                    border: `1px solid ${theme.vars.palette.border.default}`,
                    boxShadow: dragging ? theme.azes.customShadows.card : 'none',
                    transform: dragging ? 'translateY(-2px) rotate(1.5deg)' : 'none',
                  }}
                >
                  <MuiBox
                    sx={{
                      height: theme.spacing(0.75),
                      width: '70%',
                      mb: 0.5,
                      borderRadius: `${theme.shape.radiusSm}px`,
                      bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 18%, ${paper})`,
                    }}
                  />
                  <MuiBox
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <MuiBox
                      sx={{
                        width: theme.spacing(1.5),
                        height: theme.spacing(1.5),
                        borderRadius: '50%',
                        bgcolor: colIndex === 2 ? theme.vars.palette.success.main : primary,
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {price}
                    </Typography>
                  </MuiBox>
                  {dragging ? (
                    <MuiBox
                      sx={{
                        mt: 0.5,
                        height: theme.spacing(0.5),
                        width: '40%',
                        borderRadius: `${theme.shape.radiusSm}px`,
                        bgcolor: `color-mix(in srgb, ${secondary} 40%, ${paper})`,
                      }}
                    />
                  ) : null}
                </MuiBox>
              );
            })}
          </MuiBox>
        ))}
      </MuiBox>
    </LoginShowcaseCard>
  );
}
