/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/auditLogs/components/AuditLogsView/AuditLogsView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Audit logs list — backend-enforced audit.read
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import { MuiBox, Stack, Text, TextField } from '@azes/ui-web';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { useMemo } from 'react';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { PageHeader } from '../../../../shared/adminChrome/index.js';
import { useAuditLogsPage } from '../../hooks/useAuditLogsPage.js';
import type { AuditLogRow } from '../../models/types.js';
import { AuditLogsViewSkeleton } from '../AuditLogsViewSkeleton/index.js';

function formatTs(sec: number, locale: string): string {
  try {
    return new Date(sec * 1000).toLocaleString(locale);
  } catch {
    return String(sec);
  }
}

export function AuditLogsView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const { me, canRead, limit, setLimit, actionFilter, setActionFilter, listQuery, rows } =
    useAuditLogsPage();

  const columns = useMemo<AzesTableProps<AuditLogRow>['columns']>(
    () => [
      {
        id: 'createdAt',
        header: t('audit.columns.createdAt'),
        cell: ({ row }) => formatTs(row.original.createdAt, i18n.language),
      },
      { accessorKey: 'action', header: t('audit.columns.action') },
      { accessorKey: 'actorUserId', header: t('audit.columns.actor') },
      { accessorKey: 'orgId', header: t('audit.columns.org') },
      { accessorKey: 'targetType', header: t('audit.columns.targetType') },
      { accessorKey: 'targetId', header: t('audit.columns.targetId') },
    ],
    [t, i18n.language],
  );

  if (me.isLoading || (canRead && listQuery.isLoading)) {
    return <AuditLogsViewSkeleton />;
  }

  if (!canRead) {
    return (
      <Stack gap={2}>
        <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />
        <Text tone="muted">{t('audit.forbidden')}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <MuiBox
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'flex-end' },
          width: '100%',
        }}
      >
        <TextField
          label={t('audit.filters.action')}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label={t('audit.filters.limit')}
          type="number"
          value={limit}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) setLimit(Math.min(200, Math.max(1, n)));
          }}
          slotProps={{ htmlInput: { min: 1, max: 200 } }}
          sx={{ width: { xs: '100%', sm: 120 } }}
          size="small"
        />
      </MuiBox>

      {listQuery.isError ? (
        <Text tone="secondary">{t('audit.loadError')}</Text>
      ) : (
        <AzesTable
          aria-label={t('audit.title')}
          data={rows}
          columns={columns}
          getRowId={(r) => r.id}
        />
      )}
    </Stack>
  );
}
