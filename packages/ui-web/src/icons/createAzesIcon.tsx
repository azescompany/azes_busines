/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/icons/createAzesIcon.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Factory for custom AZES SVG icons
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { SvgIconProps } from '@mui/material/SvgIcon';
import { createSvgIcon } from '@mui/material/utils';
import type { ComponentType } from 'react';

export type AzesIconProps = SvgIconProps;
export type AzesIcon = ComponentType<AzesIconProps>;

/** Build a custom AZES icon from a 24×24 SVG path. */
export function createAzesIcon(path: string, displayName: string): AzesIcon {
  return createSvgIcon(<path d={path} />, displayName);
}
