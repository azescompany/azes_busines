/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavMiniList.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-05
 * ║ Purpose: Icon-only mini rail (56px) with tooltips and child menus
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Tooltip from '@mui/material/Tooltip';
import { Fragment, useId, useState } from 'react';

import { useActiveTrail, useFilteredNav, useNavLinkProps } from './AzesNavProvider';
import { NavChildrenMenu } from './NavMenuItems';
import { NavIcon } from './navStyles';
import type { AzesNavConfig, AzesNavItem } from './types';

export type AzesNavMiniListProps = {
  config: AzesNavConfig;
};

function MiniItem({ item, trail }: { item: AzesNavItem; trail: readonly string[] }) {
  const linkPropsFor = useNavLinkProps();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const inTrail = trail.includes(item.id);
  const hasChildren = Boolean(item.children?.length);
  const isAction = Boolean(item.onClick) && !hasChildren;
  const linkProps = hasChildren || isAction ? null : linkPropsFor(item);
  const tooltip = item.caption ? `${item.title} — ${item.caption}` : item.title;

  return (
    <ListItem
      disablePadding
      disableGutters
      sx={{
        '&&': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 0.5,
          px: 0,
        },
      }}
    >
      <Tooltip title={tooltip} placement="right" disableHoverListener={Boolean(anchorEl)}>
        <ListItemButton
          {...(linkProps ?? {})}
          aria-label={item.title}
          aria-current={!hasChildren && !isAction && inTrail ? 'page' : undefined}
          aria-haspopup={hasChildren ? 'menu' : undefined}
          aria-expanded={hasChildren ? Boolean(anchorEl) : undefined}
          aria-controls={hasChildren && anchorEl ? menuId : undefined}
          selected={!isAction && inTrail}
          disabled={item.disabled}
          onClick={
            hasChildren
              ? (event) => setAnchorEl(event.currentTarget)
              : isAction
                ? () => item.onClick?.()
                : undefined
          }
          sx={(theme) => ({
            '&&': {
              boxSizing: 'border-box',
              width: 40,
              minWidth: 40,
              maxWidth: 40,
              height: 40,
              minHeight: 40,
              margin: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: `${theme.shape.radiusMd}px`,
              color: 'var(--azes-nav-text)',
            },
            '&:hover': { backgroundColor: 'var(--azes-nav-hover)' },
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: 'var(--azes-nav-active-bg)',
              color: 'var(--azes-nav-active-text)',
            },
          })}
        >
          <NavIcon item={item} fallbackLetter />
        </ListItemButton>
      </Tooltip>
      {hasChildren ? (
        <NavChildrenMenu
          id={menuId}
          parent={item}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          trail={trail}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        />
      ) : null}
    </ListItem>
  );
}

export function AzesNavMiniList({ config }: AzesNavMiniListProps) {
  const nav = useFilteredNav(config);
  const trail = useActiveTrail(nav);

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        py: 1,
        px: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {nav.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? (
            <Divider sx={{ my: 1.5, width: 28, borderColor: 'var(--azes-nav-border)' }} />
          ) : null}
          <List
            disablePadding
            aria-label={group.subheader}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 0,
            }}
          >
            {group.items.map((item) => (
              <MiniItem key={item.id} item={item} trail={trail} />
            ))}
          </List>
        </Fragment>
      ))}
    </Box>
  );
}
