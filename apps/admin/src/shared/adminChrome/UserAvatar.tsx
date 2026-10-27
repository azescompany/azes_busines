/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/UserAvatar.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Initials avatar tinted with org color
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Text } from '@azes/ui-web';

export type UserAvatarProps = {
  name: string;
  colorCode?: string;
  size?: number;
};

function initials(name: string): string {
  const parts = name
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

export function UserAvatar({ name, colorCode = '#2563EB', size = 32 }: UserAvatarProps) {
  return (
    <MuiBox
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colorCode,
        color: 'common.white',
        flexShrink: 0,
        fontSize: size * 0.35,
        fontWeight: 700,
      }}
    >
      <Text as="span" size="xs" weight="bold">
        {initials(name)}
      </Text>
    </MuiBox>
  );
}
