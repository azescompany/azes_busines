/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherViewSkeleton/LauncherViewSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Layout-matched skeleton for centered apps launcher grid
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Stack } from '@azes/ui-web';
import { AzesSkeleton } from '@azes/ui-web/skeleton';

export function LauncherViewSkeleton() {
  return (
    <MuiBox sx={{ maxWidth: 1280, mx: 'auto', width: '100%', py: 3 }}>
      <Stack gap={3} align="center">
        <AzesSkeleton shape="rect" height={48} width="100%" sx={{ maxWidth: 480 }} />
        <MuiBox
          sx={{
            display: 'grid',
            justifyContent: 'center',
            justifyItems: 'center',
            gridTemplateColumns: {
              xs: 'repeat(3, 88px)',
              sm: 'repeat(4, 96px)',
              md: 'repeat(5, 104px)',
              lg: 'repeat(6, 104px)',
            },
            gap: 2,
            width: '100%',
          }}
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <Stack key={i} gap={1} align="center">
              <AzesSkeleton shape="rect" width={64} height={64} radius="lg" />
              <AzesSkeleton shape="text" width="70%" />
            </Stack>
          ))}
        </MuiBox>
      </Stack>
    </MuiBox>
  );
}
