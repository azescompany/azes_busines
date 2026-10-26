/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/components/LoginShowcase/cards/StatsCrmCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Decorative stats/CRM illustration — KPI, chart, donut, pipeline
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography, useTheme } from '@azes/ui-web';
import { useId } from 'react';

import { LoginShowcaseCard } from '../LoginShowcaseCard.js';

export type StatsCrmCardProps = {
  kpis: Array<{ label: string; value: string }>;
  stages: [string, string, string];
  rotate?: number;
  depth?: number;
  width?: string;
};

export function StatsCrmCard({ kpis, stages, rotate, depth, width }: StatsCrmCardProps) {
  const theme = useTheme();
  const gradId = useId().replace(/:/g, '');
  const primary = theme.vars.palette.primary.main;
  const secondary = theme.vars.palette.secondary.main;
  const paper = theme.vars.palette.background.paper;
  const ink = theme.vars.palette.text.primary;

  return (
    <LoginShowcaseCard id="stats" rotate={rotate} depth={depth} width={width}>
      <MuiBox sx={{ p: 1.25, display: 'grid', gap: 1 }}>
        <MuiBox sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
          {kpis.slice(0, 3).map((kpi) => (
            <MuiBox
              key={kpi.label}
              sx={{
                p: 0.75,
                borderRadius: `${theme.shape.radiusSm}px`,
                bgcolor: `color-mix(in srgb, ${primary} 8%, ${paper})`,
                border: `1px solid ${theme.vars.palette.border.default}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {kpi.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {kpi.value}
              </Typography>
            </MuiBox>
          ))}
        </MuiBox>
        <MuiBox
          component="svg"
          viewBox="0 0 320 120"
          aria-hidden
          sx={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '8 / 3' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={primary} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path
            d="M8 88 L48 70 L88 76 L128 48 L168 58 L208 36 L248 44 L312 22 L312 112 L8 112 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M8 88 L48 70 L88 76 L128 48 L168 58 L208 36 L248 44 L312 22"
            fill="none"
            stroke={primary}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M8 96 L48 90 L88 92 L128 78 L168 82 L208 68 L248 72 L312 54"
            fill="none"
            stroke={secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
          <circle
            cx="268"
            cy="52"
            r="22"
            fill={`color-mix(in srgb, ${paper} 40%, transparent)`}
            stroke={theme.vars.palette.border.default}
          />
          <path d="M268 30 A22 22 0 0 1 286 60 L268 52 Z" fill={primary} />
          <path d="M268 52 L286 60 A22 22 0 0 1 252 68 Z" fill={secondary} />
          <path
            d="M268 52 L252 68 A22 22 0 0 1 268 30 Z"
            fill={theme.vars.palette.info.main}
            opacity="0.7"
          />
        </MuiBox>
        <MuiBox sx={{ display: 'grid', gap: 0.5 }}>
          {stages.map((stage, i) => (
            <MuiBox key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant="caption" sx={{ width: '7ch', fontWeight: 600, color: ink }}>
                {stage}
              </Typography>
              <MuiBox
                sx={{
                  flex: 1,
                  height: theme.spacing(1),
                  borderRadius: `${theme.shape.radiusSm}px`,
                  bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, ${paper})`,
                  overflow: 'hidden',
                }}
              >
                <MuiBox
                  sx={{
                    width: `${70 - i * 18}%`,
                    height: '100%',
                    bgcolor:
                      i === 0 ? primary : i === 1 ? secondary : theme.vars.palette.success.main,
                  }}
                />
              </MuiBox>
            </MuiBox>
          ))}
        </MuiBox>
      </MuiBox>
    </LoginShowcaseCard>
  );
}
