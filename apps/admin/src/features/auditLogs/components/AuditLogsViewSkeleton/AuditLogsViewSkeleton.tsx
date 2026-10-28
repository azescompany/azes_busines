/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/components/AuditLogsViewSkeleton/AuditLogsViewSkeleton.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Layout-matched skeleton for audit logs view
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Stack } from '@azes/ui-web';
import { AzesSkeleton, AzesSkeletonGroup } from '@azes/ui-web/skeleton';

export function AuditLogsViewSkeleton() {
  return (
    <AzesSkeletonGroup loading label="Loading audit logs">
      <Stack gap={2}>
        <AzesSkeleton shape="rect" height={36} width="40%" />
        <AzesSkeleton shape="rect" height={20} width="60%" />
        <AzesSkeleton shape="rect" height={40} width="100%" />
        <AzesSkeleton shape="rect" height={220} width="100%" />
      </Stack>
    </AzesSkeletonGroup>
  );
}
