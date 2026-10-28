/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/landing/components/LandingModuleGrid/LandingModuleGrid.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Public module grid from MODULE_REGISTRY (no /me)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation, type SupportedLocale } from '@azes/i18n';
import { MuiBox, Text, useTheme } from '@azes/ui-web';
import { useNavigate } from 'react-router';

import { demoModulePath, pathTo } from '../../../../app/router/paths.js';
import { setDemoActiveModule } from '../../../demoSession/index.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { resolveModuleIcon } from '../../../../modules/iconMap.js';
import { MODULE_REGISTRY } from '../../../../modules/registry.js';

/** Match Apps launcher densiteti (ModuleTile tracks). */
const COLS = { xs: 3, sm: 4, md: 5, lg: 6 } as const;

export function LandingModuleGrid() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const navigate = useNavigate();
  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;

  const openDemo = (moduleId: string) => {
    setDemoActiveModule(moduleId);
    navigate(pathTo(demoModulePath(moduleId), locale));
  };

  const tileTrack = {
    xs: theme.spacing(11),
    sm: theme.spacing(12),
    md: theme.spacing(13),
  } as const;

  return (
    <MuiBox
      sx={{
        display: 'grid',
        width: '100%',
        justifyContent: 'center',
        justifyItems: 'center',
        gridTemplateColumns: {
          xs: `repeat(${COLS.xs}, ${tileTrack.xs})`,
          sm: `repeat(${COLS.sm}, ${tileTrack.sm})`,
          md: `repeat(${COLS.md}, ${tileTrack.md})`,
          lg: `repeat(${COLS.lg}, ${tileTrack.md})`,
        },
        gap: { xs: 1, sm: 2, md: 2 },
        rowGap: { xs: 1.5, sm: 2 },
      }}
    >
      {MODULE_REGISTRY.map((mod) => {
        const accentMain = theme.vars.palette[mod.accent].main;
        const title = t(mod.i18nKey);
        return (
          <MuiBox
            key={mod.id}
            role="button"
            tabIndex={0}
            aria-label={title}
            onClick={() => openDemo(mod.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openDemo(mod.id);
              }
            }}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: 1,
              minHeight: theme.spacing(12),
              cursor: 'pointer',
              borderRadius: `${theme.shape.radiusMd}px`,
              outline: 'none',
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.azes.customShadows.card,
                '& [data-azes-landing-module-icon]': {
                  outline: `2px solid ${theme.vars.palette.primary.main}`,
                  outlineOffset: 2,
                },
              },
              '&:focus-visible': {
                boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.vars.palette.primary.main} 45%, transparent)`,
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': { transform: 'none' },
              },
            }}
          >
            <MuiBox
              data-azes-landing-module-icon
              sx={{
                width: { xs: theme.spacing(7), sm: theme.spacing(8) },
                height: { xs: theme.spacing(7), sm: theme.spacing(8) },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: `${theme.shape.radiusLg}px`,
                bgcolor: `color-mix(in srgb, ${accentMain} 14%, transparent)`,
                color: accentMain,
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: theme.spacing(3.5), sm: theme.spacing(4) },
                },
              }}
            >
              {resolveModuleIcon(mod.iconKey, 'large')}
            </MuiBox>
            <MuiBox
              sx={{
                textAlign: 'center',
                lineHeight: 1.25,
                maxWidth: '100%',
                px: 0.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              <Text size="sm" weight="medium">
                {title}
              </Text>
            </MuiBox>
          </MuiBox>
        );
      })}
    </MuiBox>
  );
}
