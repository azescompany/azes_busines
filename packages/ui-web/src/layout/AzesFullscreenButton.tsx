/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesFullscreenButton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Header chrome control — enter / exit document fullscreen
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { IconFullscreen, IconFullscreenExit } from '../icons';

import { CHROME_ICON_BUTTON_PX } from './chromeMetrics';
import { useFullscreen } from './useFullscreen';

export type AzesFullscreenButtonProps = {
  /** Accessible + tooltip label when not fullscreen. */
  enterLabel: string;
  /** Accessible + tooltip label when fullscreen. */
  exitLabel: string;
  /** Element to fullscreen; defaults to `document.documentElement`. */
  target?: Element | null;
};

/** Chrome icon that toggles browser fullscreen for the app shell. */
export function AzesFullscreenButton({
  enterLabel,
  exitLabel,
  target = null,
}: AzesFullscreenButtonProps) {
  const { active, supported, toggle } = useFullscreen({ target });

  if (!supported) return null;

  const label = active ? exitLabel : enterLabel;

  return (
    <Tooltip title={label}>
      <IconButton
        type="button"
        size="small"
        color="inherit"
        aria-label={label}
        aria-pressed={active}
        onClick={() => {
          void toggle();
        }}
        sx={{
          minWidth: CHROME_ICON_BUTTON_PX,
          minHeight: CHROME_ICON_BUTTON_PX,
        }}
      >
        {active ? (
          <IconFullscreenExit fontSize="small" aria-hidden />
        ) : (
          <IconFullscreen fontSize="small" aria-hidden />
        )}
      </IconButton>
    </Tooltip>
  );
}
