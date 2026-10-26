/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/NavMenuItems.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Menu popup used by mini and horizontal nav for an item's children
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import type { ReactNode } from 'react';

import { useNavLinkProps } from './AzesNavProvider';
import { NavBadge, NavIcon } from './navStyles';
import type { AzesNavItem } from './types';

type NavMenuProps = {
  id: string;
  parent: AzesNavItem;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  trail: readonly string[];
  anchorOrigin: MenuProps['anchorOrigin'];
  transformOrigin: MenuProps['transformOrigin'];
};

export function NavChildrenMenu({
  id,
  parent,
  anchorEl,
  onClose,
  trail,
  anchorOrigin,
  transformOrigin,
}: NavMenuProps) {
  const linkPropsFor = useNavLinkProps();
  const current = trail[trail.length - 1];

  const renderItems = (items: readonly AzesNavItem[], depth: number): ReactNode[] =>
    items.flatMap((item) => {
      if (item.children?.length) {
        return [
          <ListSubheader
            key={`${item.id}-header`}
            sx={{ lineHeight: 2.5, paddingInlineStart: 2 + depth * 2 }}
          >
            {item.title}
          </ListSubheader>,
          ...renderItems(item.children, depth + 1),
        ];
      }
      const linkProps = linkPropsFor(item);
      const isCurrent = current === item.id;
      return [
        <MenuItem
          key={item.id}
          {...(linkProps ?? {})}
          selected={isCurrent}
          aria-current={isCurrent ? 'page' : undefined}
          disabled={item.disabled}
          onClick={onClose}
          sx={{ gap: 2, paddingInlineStart: 2 + depth * 2 }}
        >
          <NavIcon item={item} />
          <ListItemText primary={item.title} secondary={item.caption} />
          <NavBadge badge={item.badge} />
        </MenuItem>,
      ];
    });

  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{ list: { 'aria-label': parent.title, dense: true } }}
    >
      {renderItems(parent.children ?? [], 0)}
    </Menu>
  );
}
