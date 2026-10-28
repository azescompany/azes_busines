/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/ModuleTile/ModuleTile.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Odoo-inspired module card — flat accent tile + label
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import { Badge, IconButton, MuiBox, Text, useTheme } from '@azes/ui-web';
import { IconStar, IconStarFilled } from '@azes/ui-web/icons';
import type { KeyboardEvent, MouseEvent } from 'react';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { resolveModuleIcon } from '../../../../modules/iconMap.js';
import type { AzesModuleDef } from '../../../../modules/types.js';

export type ModuleTileProps = {
  module: AzesModuleDef;
  favorite: boolean;
  onOpen: (moduleId: string) => void;
  onToggleFavorite: (moduleId: string) => void;
  tabIndex?: number;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  tileRef?: (el: HTMLElement | null) => void;
};

export function ModuleTile({
  module,
  favorite,
  onOpen,
  onToggleFavorite,
  tabIndex = -1,
  onKeyDown,
  tileRef,
}: ModuleTileProps) {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const accentMain = theme.vars.palette[module.accent].main;
  const title = t(module.i18nKey);

  const stopFav = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(module.id);
  };

  const tile = (
    <MuiBox
      ref={tileRef}
      role="button"
      tabIndex={tabIndex}
      aria-label={title}
      data-module-id={module.id}
      onClick={() => onOpen(module.id)}
      onKeyDown={onKeyDown}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 1,
        cursor: 'pointer',
        borderRadius: `${theme.shape.radiusMd}px`,
        outline: 'none',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.azes.customShadows.card,
          '& [data-azes-module-icon]': {
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
      <IconButton
        size="small"
        aria-label={favorite ? t('apps.unfavorite') : t('apps.favorite')}
        aria-pressed={favorite}
        onClick={stopFav}
        sx={{
          position: 'absolute',
          top: 0,
          insetInlineEnd: 0,
          zIndex: 1,
          opacity: favorite ? 1 : 0.35,
          '&:hover, &:focus-visible': { opacity: 1 },
        }}
      >
        {favorite ? (
          <IconStarFilled fontSize="small" color="warning" />
        ) : (
          <IconStar fontSize="small" />
        )}
      </IconButton>

      <MuiBox
        data-azes-module-icon
        sx={{
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${theme.shape.radiusLg}px`,
          bgcolor: `color-mix(in srgb, ${accentMain} 14%, transparent)`,
          color: accentMain,
          '& .MuiSvgIcon-root': { fontSize: { xs: 28, sm: 32 } },
        }}
      >
        {resolveModuleIcon(module.iconKey, 'large')}
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

  if (module.badgeMock && module.badgeMock > 0) {
    return (
      <Badge
        badgeContent={module.badgeMock}
        color="error"
        overlap="circular"
        sx={{ width: '100%', '& .MuiBadge-badge': { top: 10, insetInlineEnd: 14 } }}
      >
        {tile}
      </Badge>
    );
  }

  return tile;
}
