/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesMainSidebar.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: In-content section nav rail (module menus) — not L-shell chrome
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import type { Breakpoint } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState, type ReactNode } from 'react';

import { AzesNavList } from '../navigation/AzesNavList';
import type { AzesNavConfig } from '../navigation/types';

export type AzesMainSidebarProps = {
  /** Section / module menus (already filtered + translated by the app). */
  nav: AzesNavConfig;
  /** Accessible name for the aside / drawer. */
  label: string;
  /** Optional title strip above the list. */
  title?: ReactNode;
  /** Slot below the title (e.g. module badge). */
  header?: ReactNode;
  /** Breakpoint where the sticky rail replaces the mobile drawer. Default `lg`. */
  layoutQuery?: Breakpoint;
  /** Opens the temporary drawer below `layoutQuery`. */
  openMenuLabel?: string;
  /** Closes the temporary drawer. */
  closeMenuLabel?: string;
};

/**
 * Content-area sidebar for the active module/section.
 * Distinct from chrome `AzesVerticalNav` (fixed L-shell rail).
 *
 * - `lg+`: sticky column using `--azes-layout-content-sidebar-width`
 * - below: compact menu button + temporary drawer
 */
export function AzesMainSidebar({
  nav,
  label,
  title,
  header,
  layoutQuery = 'lg',
  openMenuLabel = 'Open section menu',
  closeMenuLabel = 'Close section menu',
}: AzesMainSidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up(layoutQuery));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  const hasItems = nav.some((g) => g.items.length > 0);
  if (!hasItems) return null;

  const panel = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: '100%',
        minHeight: 0,
        py: 1.5,
        px: 1,
      }}
    >
      {title ? (
        <Box
          sx={{
            px: 1.5,
            pb: 0.5,
            typography: 'subtitle2',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {title}
        </Box>
      ) : null}
      {header}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
        }}
      >
        <AzesNavList
          config={nav}
          dense
          onNavigate={() => {
            setMobileOpen(false);
          }}
        />
      </Box>
    </Box>
  );

  if (isDesktop) {
    return (
      <Box
        component="aside"
        aria-label={label}
        data-azes-main-sidebar=""
        sx={{
          flexShrink: 0,
          width: 'var(--azes-layout-content-sidebar-width)',
          alignSelf: 'flex-start',
          position: 'sticky',
          top: 0,
          maxHeight: '100%',
          borderInlineEnd: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          borderRadius: (t) => `${t.shape.radiusMd}px`,
          mr: { lg: 2 },
        }}
      >
        {panel}
      </Box>
    );
  }

  return (
    <>
      <Box
        data-azes-main-sidebar-trigger=""
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <IconButton
          size="medium"
          aria-label={openMenuLabel}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        {title ? (
          <Box component="span" sx={{ typography: 'subtitle2', fontWeight: 600 }}>
            {title}
          </Box>
        ) : null}
      </Box>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            'aria-label': label,
            sx: {
              width: 'var(--azes-layout-content-sidebar-width)',
              maxWidth: '85vw',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Box
          data-azes-main-sidebar=""
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              px: 1,
              pt: 1,
            }}
          >
            <IconButton
              size="small"
              aria-label={closeMenuLabel}
              onClick={() => setMobileOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {panel}
        </Box>
      </Drawer>
    </>
  );
}
