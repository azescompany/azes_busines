/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/shared/ModulePlaceholderPage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Shared placeholder for all demo module menu pages
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import { MuiBox, Stack, Text } from '@azes/ui-web';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { useMemo } from 'react';
import { useParams } from 'react-router';

import { ADMIN_NAMESPACE } from '../../i18n/createAdminI18n.js';
import { EmptyState, PageHeader } from '../../shared/adminChrome/index.js';
import { resolveModuleIcon } from '../iconMap.js';
import { getModuleById } from '../resolveModules.js';

type MockRow = { id: string; name: string; status: string };

const MOCK_ROWS: MockRow[] = [
  { id: '1', name: 'Sample A', status: 'draft' },
  { id: '2', name: 'Sample B', status: 'open' },
  { id: '3', name: 'Sample C', status: 'done' },
];

export function ModulePlaceholderPage() {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const { moduleId } = useParams<{ moduleId: string }>();
  const mod = getModuleById(moduleId);

  const columns = useMemo<AzesTableProps<MockRow>['columns']>(
    () => [
      { accessorKey: 'id', header: t('apps.table.id') },
      { accessorKey: 'name', header: t('apps.table.name') },
      { accessorKey: 'status', header: t('apps.table.status') },
    ],
    [t],
  );

  if (!mod) {
    return (
      <EmptyState
        title={t('apps.placeholder.unknownTitle')}
        description={t('apps.placeholder.unknownBody')}
      />
    );
  }

  const title = t(mod.i18nKey);
  const icon = resolveModuleIcon(mod.iconKey, 'large');

  return (
    <Stack gap={3}>
      <PageHeader
        title={title}
        subtitle={t('apps.placeholder.body')}
        startAdornment={
          <MuiBox
            sx={{
              width: 48,
              height: 48,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: `${mod.accent}.main`,
              color: `${mod.accent}.contrastText`,
            }}
          >
            {icon}
          </MuiBox>
        }
      />

      <EmptyState
        icon={resolveModuleIcon(mod.iconKey, 'large')}
        title={t('apps.placeholder.title')}
        description={t('apps.placeholder.body')}
      />

      <Stack gap={2}>
        <Text size="sm" weight="semibold">
          {t('apps.table.sampleTitle')}
        </Text>
        <AzesTable
          aria-label={t('apps.table.sampleTitle')}
          data={MOCK_ROWS}
          columns={columns}
          getRowId={(r) => r.id}
        />
      </Stack>
    </Stack>
  );
}
