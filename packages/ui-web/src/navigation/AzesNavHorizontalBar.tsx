/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/AzesNavHorizontalBar.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Adobe menus toolbar — fixed-width cells, ellipsis + NavScroller
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { useId, useState } from 'react';

import { AzesNavScroller } from './AzesNavScroller';
import { useActiveTrail, useFilteredNav, useNavLinkProps } from './AzesNavProvider';
import { NavChildrenMenu } from './NavMenuItems';
import { NavBadge, NavIcon } from './navStyles';
import type { AzesNavConfig, AzesNavItem } from './types';
import { useOverflowTitle } from './useOverflowTitle';

export type AzesNavHorizontalBarProps = {
  config: AzesNavConfig;
  /** i18n: previous menus (scroller arrow). */
  prevMenusLabel?: string;
  /** i18n: next menus (scroller arrow). */
  nextMenusLabel?: string;
};

function TopItem({ item, trail }: { item: AzesNavItem; trail: readonly string[] }) {
  const theme = useTheme();
  const linkPropsFor = useNavLinkProps();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const inTrail = trail.includes(item.id);
  const hasChildren = Boolean(item.children?.length);
  const isAction = Boolean(item.onClick) && !hasChildren;
  const linkProps = hasChildren || isAction ? null : linkPropsFor(item);
  const active = !hasChildren && !isAction && inTrail;
  const { title: overflowTitle, ref: labelRef } = useOverflowTitle(item.title);
  const iconSize = theme.azes.navScroller.iconSizePx;

  const button = (
    <ButtonBase
      {...(linkProps ?? {})}
      aria-current={active ? 'page' : undefined}
      aria-haspopup={hasChildren ? 'menu' : undefined}
      aria-expanded={hasChildren ? Boolean(anchorEl) : undefined}
      aria-controls={hasChildren && anchorEl ? menuId : undefined}
      disabled={item.disabled}
      onClick={
        hasChildren
          ? (event) => setAnchorEl(event.currentTarget)
          : isAction
            ? () => item.onClick?.()
            : undefined
      }
      sx={(theme) => {
        const ns = theme.azes.navScroller;
        const ink = theme.vars.palette.common.black;
        const cell = theme.spacing(ns.itemWidthSpacing);
        const labelSize = theme.typography.pxToRem(ns.labelFontSizePx);
        const chevronSize = theme.typography.pxToRem(ns.childChevronSizePx);
        return {
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing(ns.itemGapSpacing),
          flex: '0 0 auto',
          width: cell,
          minWidth: cell,
          maxWidth: cell,
          height: '100%',
          minHeight: 'var(--azes-layout-nav-horizontal-height)',
          maxHeight: 'var(--azes-layout-nav-horizontal-height)',
          paddingInline: theme.spacing(ns.itemPaddingInlineSpacing),
          paddingBlock: theme.spacing(0.375),
          boxSizing: 'border-box',
          borderRadius: 0,
          fontFamily: theme.typography.fontFamily,
          fontSize: labelSize,
          lineHeight: 1.2,
          letterSpacing: '0.02em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontWeight: theme.typography.fontWeightRegular,
          // Soft lift only — heavy shadows made captions look coarse on the wash.
          textShadow: `0 0.5px 1px color-mix(in srgb, ${ink} 28%, transparent)`,
          color: active
            ? 'var(--azes-nav-active-text)'
            : `color-mix(in srgb, var(--azes-nav-text) 92%, transparent)`,
          backgroundColor: 'transparent',
          opacity: active ? 1 : 0.92,
          transition: theme.transitions.create(['opacity', 'background-color', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '& .MuiSvgIcon-root': {
            color: 'currentColor',
          },
          '&:hover': {
            backgroundColor: 'var(--azes-nav-hover)',
            opacity: 1,
            color: 'var(--azes-nav-text-strong)',
          },
          '&.Mui-disabled': { opacity: 0.4 },
          '&::after': {
            content: '""',
            position: 'absolute',
            insetInline: theme.spacing(1.5),
            insetBlockEnd: 0,
            height: ns.underlineHeightPx,
            backgroundColor: active
              ? 'var(--azes-nav-active-underline, var(--azes-nav-active-text))'
              : 'transparent',
            borderRadius: theme.shape.radiusFull,
            pointerEvents: 'none',
          },
          // Child chevron stays token-sized (not inherited from icon slot).
          '& [data-azes-nav-child-chevron]': {
            fontSize: chevronSize,
            opacity: 0.75,
          },
        };
      }}
    >
      <NavIcon item={item} size={iconSize} />
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        <Box
          ref={labelRef}
          component="span"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            maxWidth: hasChildren ? 'calc(100% - 0.875rem)' : '100%',
          }}
        >
          {item.title}
        </Box>
        {hasChildren ? (
          <ExpandMoreIcon data-azes-nav-child-chevron="" aria-hidden sx={{ flexShrink: 0 }} />
        ) : null}
      </Box>
      <NavBadge badge={item.badge} />
    </ButtonBase>
  );

  return (
    <Box component="li" sx={{ display: 'flex', height: '100%', flex: '0 0 auto' }}>
      <Tooltip
        title={overflowTitle}
        disableHoverListener={!overflowTitle}
        disableFocusListener={!overflowTitle}
        enterDelay={400}
      >
        <Box sx={{ display: 'flex', height: '100%' }}>{button}</Box>
      </Tooltip>
      {hasChildren ? (
        <NavChildrenMenu
          id={menuId}
          parent={item}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          trail={trail}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        />
      ) : null}
    </Box>
  );
}

export function AzesNavHorizontalBar({
  config,
  prevMenusLabel = 'Previous menus',
  nextMenusLabel = 'Next menus',
}: AzesNavHorizontalBarProps) {
  const nav = useFilteredNav(config);
  const trail = useActiveTrail(nav);
  const items = nav.flatMap((group) => group.items);
  const activeKey = trail[trail.length - 1] ?? '';

  return (
    <AzesNavScroller prevLabel={prevMenusLabel} nextLabel={nextMenusLabel} activeKey={activeKey}>
      <Box
        component="ul"
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          height: '100%',
          width: 'max-content',
          flex: '0 0 auto',
        }}
      >
        {items.map((item) => (
          <TopItem key={item.id} item={item} trail={trail} />
        ))}
      </Box>
    </AzesNavScroller>
  );
}
