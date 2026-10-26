/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/locale/AzesAccountMenu.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-10
 * ║ Purpose: App-bar account control built on AzesMenu (logout + actions)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';

import { AzesMenu } from '../menu/AzesMenu';
import type { AzesMenuActionItem } from '../menu/types';

export type AzesAccountMenuProps = {
  /** Full name or subject shown in the menu header. */
  displayName?: string | null;
  /** Optional secondary line (role, email). */
  subtitle?: string | null;
  /** Accessible / tooltip label for the avatar button. */
  label?: string;
  logoutLabel: string;
  onLogout: () => void;
  /** Extra actions rendered above logout. */
  items?: AzesMenuActionItem[];
  /**
   * `nav` — sits on contrast/integrated chrome; border follows `--azes-nav-*`.
   * `default` — paper chip for light content surfaces.
   */
  surface?: 'default' | 'nav';
};

function initialsFromName(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/**
 * App-bar account control: fixed-size avatar trigger + AzesMenu panel.
 */
export function AzesAccountMenu({
  displayName,
  subtitle,
  label = 'Account',
  logoutLabel,
  onLogout,
  items: extraItems,
  surface = 'default',
}: AzesAccountMenuProps) {
  const theme = useTheme();
  const initials = initialsFromName(displayName);
  const onNav = surface === 'nav';
  const title = displayName?.trim() || label;

  const items = useMemo<AzesMenuActionItem[]>(
    () => [
      ...(extraItems ?? []),
      {
        id: 'logout',
        label: logoutLabel,
        icon: <LogoutOutlined fontSize="small" />,
        danger: true,
        onSelect: () => {
          onLogout();
        },
      },
    ],
    [extraItems, logoutLabel, onLogout],
  );

  return (
    <AzesMenu
      aria-label={label}
      placement="bottom-end"
      width="sm"
      items={items}
      header={
        <Box sx={{ maxWidth: theme.azes.menu.widthSm, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: theme.typography.fontWeightBold }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      }
      trigger={({ props, onClick }) => (
        <Tooltip title={title}>
          <IconButton
            {...props}
            size="small"
            color="inherit"
            aria-label={label}
            onClick={onClick}
            sx={{
              p: onNav ? '2px' : 0.25,
              borderRadius: `${theme.shape.radiusMd}px`,
              border: onNav
                ? '1px solid color-mix(in srgb, var(--azes-nav-text-strong) 28%, transparent)'
                : `1px solid ${theme.vars.palette.border.default}`,
              bgcolor: onNav ? 'transparent' : theme.vars.palette.background.paper,
              boxShadow: onNav
                ? 'none'
                : `0 1px 0 color-mix(in srgb, ${theme.vars.palette.common.black} 4%, transparent)`,
              '&:hover': onNav
                ? {
                    borderColor: 'color-mix(in srgb, var(--azes-nav-text-strong) 45%, transparent)',
                    bgcolor: 'var(--azes-nav-hover)',
                  }
                : {
                    borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.border.default})`,
                  },
            }}
          >
            <Avatar
              sx={{
                width: theme.spacing(4.25),
                height: theme.spacing(4.25),
                fontSize: theme.typography.caption.fontSize,
                fontWeight: theme.typography.fontWeightBold,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
      )}
    />
  );
}
