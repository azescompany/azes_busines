/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/AzesSidePanelHost.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Single MUI Drawer shell for the active AzesSidePanel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useId, useRef } from 'react';

import { IconClose } from '../icons';
import {
  useSidePanelApi,
  useSidePanelHostLabels,
  useSidePanelPortal,
} from './AzesSidePanelProvider';
import {
  getSidePanelBodySx,
  getSidePanelFooterSx,
  getSidePanelHeaderSx,
  getSidePanelPaperSx,
  getSidePanelSubtitleSx,
  getSidePanelTitleSx,
} from './sidePanelStyles';

export function AzesSidePanelHost() {
  const theme = useTheme();
  const api = useSidePanelApi();
  const portal = useSidePanelPortal();
  const hostLabels = useSidePanelHostLabels();
  const titleId = useId();
  const subtitleId = useId();
  const active = api.activeId ? api.getRegistration(api.activeId) : undefined;
  const open = Boolean(api.activeId);
  const width = active?.width ?? 'md';
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    portal.setBodyEl(bodyRef.current);
    portal.setFooterEl(footerRef.current);
    return () => {
      portal.setBodyEl(null);
      portal.setFooterEl(null);
    };
  }, [portal, open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        void api.close();
      }}
      role="presentation"
      // Keep below modal dialogs (AzesDialog / MUI Modal).
      sx={{ zIndex: (t) => t.zIndex.drawer }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          'aria-describedby': active?.subtitle ? subtitleId : undefined,
          sx: getSidePanelPaperSx(theme, width),
        },
      }}
    >
      <Box sx={getSidePanelHeaderSx(theme)}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id={titleId} component="h2" sx={getSidePanelTitleSx(theme)} tabIndex={-1}>
            {active?.title ?? ''}
          </Typography>
          {active?.subtitle ? (
            <Typography id={subtitleId} component="p" sx={getSidePanelSubtitleSx(theme)}>
              {active.subtitle}
            </Typography>
          ) : null}
        </Box>
        <IconButton
          aria-label={hostLabels.close}
          onClick={() => {
            void api.close();
          }}
          size="small"
          sx={(t) => ({
            width: t.spacing(4.5),
            height: t.spacing(4.5),
            borderRadius: t.azesRadius.full,
            '&:hover': {
              backgroundColor: `color-mix(in srgb, ${t.vars.palette.primary.main} 8%, transparent)`,
            },
          })}
        >
          <IconClose fontSize="small" />
        </IconButton>
      </Box>

      <Box ref={bodyRef} sx={getSidePanelBodySx(theme)} data-azes-side-panel-body="" />

      <Box
        ref={footerRef}
        sx={{
          ...getSidePanelFooterSx(theme),
          '&:empty': { display: 'none' },
        }}
        data-azes-side-panel-footer=""
      />
    </Drawer>
  );
}
