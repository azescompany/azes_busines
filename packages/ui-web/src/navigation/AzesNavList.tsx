/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavList.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Vertical nav — ellipsis labels, overflow tooltips, active trail
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useId, useState } from 'react';

import { useActiveTrail, useFilteredNav, useNavLinkProps } from './AzesNavProvider';
import { NavBadge, NavIcon, navItemSx, navSubheaderSx } from './navStyles';
import type { AzesNavConfig, AzesNavItem } from './types';
import { useOverflowTitle } from './useOverflowTitle';

export type AzesNavListProps = {
  config: AzesNavConfig;
  /** Called after a link is chosen (mobile drawer closes). */
  onNavigate?: () => void;
  /** Dense footer strip (Docs / AI) — tighter padding. */
  dense?: boolean;
};

type ItemProps = {
  item: AzesNavItem;
  depth: number;
  trail: readonly string[];
  onNavigate?: () => void;
};

function NavLabel({ title, caption }: { title: string; caption?: string }) {
  const { title: overflowTitle, ref } = useOverflowTitle(title);

  return (
    <Tooltip
      title={overflowTitle}
      disableHoverListener={!overflowTitle}
      disableFocusListener={!overflowTitle}
      enterDelay={400}
      placement="right"
    >
      <ListItemText
        primary={
          <Box
            ref={ref}
            component="span"
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 'inherit',
              fontSize: 'inherit',
            }}
          >
            {title}
          </Box>
        }
        secondary={caption}
        sx={{ my: 0, minWidth: 0, overflow: 'hidden' }}
        slotProps={{
          secondary: {
            noWrap: true,
            sx: {
              color: 'var(--azes-nav-subheader)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          },
        }}
      />
    </Tooltip>
  );
}

function NavListItem({ item, depth, trail, onNavigate }: ItemProps) {
  const linkPropsFor = useNavLinkProps();
  const childrenId = useId();
  const inTrail = trail.includes(item.id);
  const isCurrent = trail[trail.length - 1] === item.id;
  const hasChildren = Boolean(item.children?.length);
  const [open, setOpen] = useState(inTrail);

  useEffect(() => {
    if (inTrail) setOpen(true);
  }, [inTrail]);

  const content = (
    <>
      <NavIcon item={item} />
      <NavLabel title={item.title} caption={item.caption} />
      <NavBadge badge={item.badge} />
    </>
  );

  if (hasChildren) {
    return (
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          aria-expanded={open}
          aria-controls={childrenId}
          disabled={item.disabled}
          onClick={() => setOpen((value) => !value)}
          sx={(theme) => navItemSx(theme, { depth, active: inTrail, selected: false })}
        >
          {content}
          <ExpandMoreIcon
            aria-hidden
            fontSize="small"
            sx={(theme) => ({
              flexShrink: 0,
              transition: theme.transitions.create('transform'),
              transform: open ? 'rotate(180deg)' : 'none',
            })}
          />
        </ListItemButton>
        <Collapse in={open} unmountOnExit>
          <List id={childrenId} disablePadding>
            {item.children?.map((child) => (
              <NavListItem
                key={child.id}
                item={child}
                depth={depth + 1}
                trail={trail}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      </ListItem>
    );
  }

  const linkProps = linkPropsFor(item);
  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        {...(item.onClick ? {} : (linkProps ?? {}))}
        selected={isCurrent}
        aria-current={isCurrent ? 'page' : undefined}
        disabled={item.disabled}
        onClick={() => {
          if (item.onClick) {
            item.onClick();
          }
          // Close mobile drawer for links and action items (e.g. AI).
          onNavigate?.();
        }}
        sx={(theme) => navItemSx(theme, { depth, active: inTrail, selected: isCurrent })}
      >
        {content}
      </ListItemButton>
    </ListItem>
  );
}

export function AzesNavList({ config, onNavigate, dense = false }: AzesNavListProps) {
  const nav = useFilteredNav(config);
  const trail = useActiveTrail(nav);

  return (
    <Box sx={{ paddingInline: dense ? 1.5 : 2, paddingBlock: dense ? 1 : 2 }}>
      {nav.map((group) => (
        <List
          key={group.id}
          disablePadding
          subheader={
            group.subheader ? (
              <ListSubheader disableSticky component="div" sx={navSubheaderSx}>
                {group.subheader}
              </ListSubheader>
            ) : undefined
          }
          sx={{ mb: dense ? 0 : 2 }}
        >
          {group.items.map((item) => (
            <NavListItem
              key={item.id}
              item={item}
              depth={1}
              trail={trail}
              onNavigate={onNavigate}
            />
          ))}
        </List>
      ))}
    </Box>
  );
}
