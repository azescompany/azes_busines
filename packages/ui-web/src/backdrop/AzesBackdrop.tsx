/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/backdrop/AzesBackdrop.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Thin Backdrop wrapper — glass (default) or plain
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Backdrop, { type BackdropProps } from '@mui/material/Backdrop';
import { useTheme } from '@mui/material/styles';

import { getBackdropSx } from './backdropStyles';

export type AzesBackdropProps = Omit<BackdropProps, 'invisible'> & {
  /** Glass uses primary tint + blur; plain is a simple dim. Default glass. */
  variant?: 'glass' | 'plain';
  /** Transparent click-catcher — never applies glass. */
  invisible?: boolean;
};

export function AzesBackdrop({
  variant = 'glass',
  invisible = false,
  sx,
  ...rest
}: AzesBackdropProps) {
  const theme = useTheme();
  const glassSx = getBackdropSx(theme, {
    invisible,
    plain: variant === 'plain',
  });

  return (
    <Backdrop
      invisible={invisible}
      sx={[glassSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...rest}
    />
  );
}
