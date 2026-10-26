/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/AzesMenu.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Global typed menu — trigger render-prop + items array
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Check from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grow from '@mui/material/Grow';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { useCallback, useId, useMemo, useState, type MouseEvent, type ReactNode } from 'react';

import {
  getMenuDividerSx,
  getMenuHeaderSx,
  getMenuItemSx,
  getMenuListSx,
  getMenuPaperSx,
  getMenuSectionHeaderSx,
} from './menuStyles';
import type {
  AzesMenuItem,
  AzesMenuPlacement,
  AzesMenuSelectionMode,
  AzesMenuTriggerAriaProps,
  AzesMenuWidth,
} from './types';
import { isAzesMenuActionItem } from './types';
import { useAzesMenu } from './useAzesMenu';

export type AzesMenuProps = {
  items: AzesMenuItem[];
  trigger: (api: {
    open: boolean;
    props: AzesMenuTriggerAriaProps;
    onClick: (event: MouseEvent<HTMLElement>) => void;
  }) => ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectionMode?: AzesMenuSelectionMode;
  header?: ReactNode;
  footer?: ReactNode;
  placement?: AzesMenuPlacement;
  width?: AzesMenuWidth;
  maxHeight?: number | string;
  matchTriggerWidth?: boolean;
  loading?: boolean;
  emptyLabel?: ReactNode;
  'aria-label': string;
  sx?: SxProps<Theme>;
};

function placementToOrigins(placement: AzesMenuPlacement) {
  switch (placement) {
    case 'bottom-start':
      return {
        anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
      };
    case 'top-start':
      return {
        anchorOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
        transformOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
      };
    case 'top-end':
      return {
        anchorOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
      };
    case 'bottom-end':
    default:
      return {
        anchorOrigin: { vertical: 'bottom' as const, horizontal: 'right' as const },
        transformOrigin: { vertical: 'top' as const, horizontal: 'right' as const },
      };
  }
}

export function AzesMenu({
  items,
  trigger,
  open: openProp,
  defaultOpen,
  onOpenChange,
  selectionMode = 'none',
  header,
  footer,
  placement = 'bottom-end',
  width = 'auto',
  maxHeight,
  matchTriggerWidth = false,
  loading = false,
  emptyLabel,
  'aria-label': ariaLabel,
  sx,
}: AzesMenuProps) {
  const theme = useTheme();
  const menuId = useId();
  const triggerId = useId();
  const menuState = useAzesMenu({ open: openProp, defaultOpen, onOpenChange });
  const { open, close, toggle, anchorEl } = menuState;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  const origins = useMemo(() => placementToOrigins(placement), [placement]);
  const hasIcons = items.some((item) => isAzesMenuActionItem(item) && item.icon != null);

  const handleTriggerClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      setTriggerWidth(event.currentTarget.getBoundingClientRect().width);
      toggle(event);
    },
    [toggle],
  );

  const handleSelect = useCallback(
    async (item: Extract<AzesMenuItem, { id: string; label: ReactNode }>) => {
      if (!isAzesMenuActionItem(item) || item.disabled || pendingId) return;
      const closeOnSelect = item.closeOnSelect !== false;
      try {
        if (item.onSelect) {
          const result = item.onSelect();
          if (result && typeof (result as Promise<void>).then === 'function') {
            setPendingId(item.id);
            await result;
            setPendingId(null);
          }
        }
        if (closeOnSelect) {
          close();
        }
      } catch {
        setPendingId(null);
        // Stay open — caller owns error UI.
      }
    },
    [close, pendingId],
  );

  const triggerAria: AzesMenuTriggerAriaProps = {
    id: triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
  };

  const actionItems = items.filter(isAzesMenuActionItem);
  const showEmpty = !loading && actionItems.length === 0;

  return (
    <>
      {trigger({ open, props: triggerAria, onClick: handleTriggerClick })}
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        disableScrollLock
        transitionDuration={{
          enter: theme.transitions.duration.enteringScreen,
          exit: theme.transitions.duration.leavingScreen,
        }}
        slots={{ transition: Grow }}
        slotProps={{
          transition: {
            style: {
              transformOrigin: `${origins.transformOrigin.horizontal} ${origins.transformOrigin.vertical}`,
            },
          },
          paper: {
            sx: [
              getMenuPaperSx(theme, {
                width,
                maxHeight,
                matchTriggerWidth,
                triggerWidth,
              }),
              ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ],
          },
          list: {
            // Prefer aria-label over labelledby so the menu name is not the trigger text.
            'aria-label': ariaLabel,
            dense: theme.azes.density === 'compact',
            sx: getMenuListSx(theme),
            autoFocusItem: open,
          },
        }}
        anchorOrigin={origins.anchorOrigin}
        transformOrigin={origins.transformOrigin}
      >
        {header ? (
          <Box sx={getMenuHeaderSx(theme)} role="presentation">
            {header}
          </Box>
        ) : null}

        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <MenuItem
                key={`skel-${index}`}
                disabled
                disableRipple
                sx={{ minHeight: theme.azes.menu.itemMinHeight }}
              >
                <Skeleton variant="text" width="80%" />
              </MenuItem>
            ))
          : null}

        {showEmpty ? (
          <MenuItem disabled disableRipple>
            <ListItemText primary={emptyLabel ?? '—'} />
          </MenuItem>
        ) : null}

        {!loading
          ? items.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <Divider
                    key={item.id ?? `divider-${index}`}
                    component="li"
                    role="separator"
                    sx={getMenuDividerSx(theme)}
                  />
                );
              }
              if (item.type === 'header') {
                return (
                  <Box
                    key={item.id}
                    component="li"
                    role="presentation"
                    sx={getMenuSectionHeaderSx(theme)}
                  >
                    {item.label}
                  </Box>
                );
              }

              const selected = Boolean(item.selected);
              const busy = pendingId === item.id;
              const role = selectionMode === 'single' ? 'menuitemradio' : 'menuitem';

              return (
                <MenuItem
                  key={item.id}
                  role={role}
                  disabled={item.disabled || Boolean(pendingId)}
                  selected={selectionMode === 'single' ? selected : false}
                  aria-checked={selectionMode === 'single' ? selected : undefined}
                  aria-busy={busy || undefined}
                  onClick={() => {
                    if (item.href) {
                      window.location.assign(item.href);
                    }
                    void handleSelect(item);
                  }}
                  sx={getMenuItemSx(theme, { danger: item.danger, selected })}
                >
                  {(hasIcons || item.icon) && (
                    <ListItemIcon
                      sx={{
                        minWidth: theme.spacing(4),
                        color: 'inherit',
                      }}
                    >
                      {item.icon ?? <Box aria-hidden sx={{ width: theme.spacing(3) }} />}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    slotProps={{
                      primary: {
                        sx: {
                          typography: 'body2',
                          fontWeight: selected
                            ? theme.typography.fontWeightMedium
                            : theme.typography.fontWeightRegular,
                        },
                      },
                      secondary: {
                        sx: { typography: 'caption', color: 'text.secondary' },
                      },
                    }}
                  />
                  {item.shortcut ? (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, flexShrink: 0 }}
                    >
                      {item.shortcut}
                    </Typography>
                  ) : null}
                  {item.endAdornment ? (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, flexShrink: 0 }}
                    >
                      {item.endAdornment}
                    </Typography>
                  ) : null}
                  {busy ? (
                    <CircularProgress size={theme.spacing(2)} sx={{ ml: 1 }} aria-hidden />
                  ) : selectionMode === 'single' && selected ? (
                    <Check fontSize="small" color="primary" aria-hidden />
                  ) : null}
                </MenuItem>
              );
            })
          : null}

        {footer ? (
          <Box
            sx={{
              ...getMenuHeaderSx(theme),
              borderTop: `1px solid ${theme.vars.palette.border.default}`,
            }}
            role="presentation"
          >
            {footer}
          </Box>
        ) : null}
      </Menu>
    </>
  );
}
