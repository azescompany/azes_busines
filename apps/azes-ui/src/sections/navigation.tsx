/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/navigation.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Tabs, pagination, breadcrumbs and menus showcase sections
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  MuiBox,
  MuiButton,
  Pagination,
  Popover,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@azes/ui-web';
import { useState, type MouseEvent } from 'react';

import { SectionIntro, StackText } from './shared.js';

export function NavigationSection() {
  const [tab, setTab] = useState(0);

  return (
    <StackText>
      <Typography variant="body1">
        The app shell is AzesDashboardLayout. Switch vertical, mini and horizontal navigation in the
        settings drawer; see the Navigation engine section for the data model.
      </Typography>
      <Tabs value={tab} onChange={(_event, value: number) => setTab(value)}>
        <Tab label="Foundations" />
        <Tab label="Components" />
        <Tab label="Navigation" />
      </Tabs>
      <Pagination count={8} page={2} color="primary" />
    </StackText>
  );
}

export function BreadcrumbsSection() {
  return (
    <SectionIntro title="Prefer breadcrumbs when hierarchy is deeper than two levels.">
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="#/overview">
          AZES UI
        </Link>
        <Link underline="hover" color="inherit" href="#/navigation">
          Navigation
        </Link>
        <Typography color="text.primary">Breadcrumbs</Typography>
      </Breadcrumbs>
      <Typography variant="body2" color="text.secondary">
        Links use theme text.link.
      </Typography>
    </SectionIntro>
  );
}

export function MenusSection() {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  return (
    <SectionIntro title="Menu and Popover paper use radiusMd and the modal z-index stack.">
      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <MuiButton
          variant="outlined"
          onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
        >
          Open menu
        </MuiButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <MenuItem onClick={() => setMenuAnchor(null)}>Profile</MenuItem>
          <MenuItem onClick={() => setMenuAnchor(null)}>Settings</MenuItem>
        </Menu>

        <MuiButton
          variant="outlined"
          onClick={(event: MouseEvent<HTMLButtonElement>) => setPopoverAnchor(event.currentTarget)}
        >
          Open popover
        </MuiButton>
        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Typography sx={{ p: 2, maxWidth: 240 }}>
            Menu and Popover paper use radiusMd and the modal z-index stack.
          </Typography>
        </Popover>

        <Tooltip title="Inverse surface tooltip">
          <MuiButton variant="text">Hover tooltip</MuiButton>
        </Tooltip>
      </MuiBox>
    </SectionIntro>
  );
}
