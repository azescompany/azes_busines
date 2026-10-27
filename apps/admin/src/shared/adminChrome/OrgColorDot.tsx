/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/OrgColorDot.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Org color swatch indicator (palette hex from API)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox } from '@azes/ui-web';

export type OrgColorDotProps = {
  colorCode: string;
  size?: number;
  label?: string;
};

export function OrgColorDot({ colorCode, size = 12, label }: OrgColorDotProps) {
  return (
    <MuiBox
      component="span"
      aria-label={label ?? colorCode}
      sx={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 0.5,
        bgcolor: colorCode,
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    />
  );
}
