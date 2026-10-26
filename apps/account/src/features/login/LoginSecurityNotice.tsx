/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/LoginSecurityNotice.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Compact device-ID security row under login form
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Collapse, MuiBox, MuiButton, Typography, useTheme } from '@azes/ui-web';
import { IconSecurity } from '@azes/ui-web/icons';
import { useEffect, useId, useState } from 'react';

import { getMaskedDeviceId } from '../../lib/deviceId.js';

export type LoginSecurityNoticeProps = {
  title: string;
  details: string;
  moreLabel: string;
  lessLabel: string;
  deviceIdLabel: string;
  disabled?: boolean;
};

export function LoginSecurityNotice({
  title,
  details,
  moreLabel,
  lessLabel,
  deviceIdLabel,
  disabled,
}: LoginSecurityNoticeProps) {
  const theme = useTheme();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [maskedId, setMaskedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getMaskedDeviceId().then((id) => {
      if (!cancelled) setMaskedId(id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MuiBox
      sx={{
        mt: 2.5,
        p: 1.5,
        borderRadius: `${theme.shape.radiusLg}px`,
        border: `1px solid ${theme.vars.palette.border.default}`,
        bgcolor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 6%, ${theme.vars.palette.background.paper})`,
      }}
    >
      <MuiBox sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
        <IconSecurity
          aria-hidden
          sx={{
            mt: 0.25,
            fontSize: theme.spacing(2.5),
            color: theme.vars.palette.primary.main,
            flexShrink: 0,
          }}
        />
        <MuiBox sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {maskedId ? (
            <Typography
              variant="caption"
              component="p"
              sx={{
                mt: 0.5,
                fontFamily: theme.typography.fontFamilyMono,
                color: 'text.secondary',
                letterSpacing: 0.04,
              }}
            >
              {deviceIdLabel} {maskedId}
            </Typography>
          ) : null}
          <MuiButton
            type="button"
            size="small"
            color="primary"
            disabled={disabled}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            sx={{
              mt: 0.5,
              px: 0.5,
              minWidth: 0,
              typography: 'caption',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {open ? lessLabel : moreLabel}
          </MuiButton>
          <Collapse in={open}>
            <Typography
              id={panelId}
              variant="caption"
              color="text.secondary"
              component="p"
              sx={{ mt: 0.75, display: 'block', lineHeight: 1.5 }}
            >
              {details}
            </Typography>
          </Collapse>
        </MuiBox>
      </MuiBox>
    </MuiBox>
  );
}
