/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/UsersView/UsersView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Active-org members list (tenant users)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { OrgMembership } from '@azes/api/azes/models';
import { useGetApiV1MeOrganizations, useGetApiV1OrgsOrgIdMembers } from '@azes/api/azes/orgs';
import { useTranslation } from '@azes/i18n';
import { Stack, Text } from '@azes/ui-web';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { useMemo } from 'react';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

export function UsersView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const myOrgs = useGetApiV1MeOrganizations();
  const activeOrgId = myOrgs.data?.items?.find((i) => i.isActive)?.orgId ?? '';

  const membersQuery = useGetApiV1OrgsOrgIdMembers(activeOrgId, {
    query: { enabled: Boolean(activeOrgId) },
  });

  const columns = useMemo<AzesTableProps<OrgMembership>['columns']>(
    () => [
      { accessorKey: 'username', header: t('orgs.members.columns.user') },
      { accessorKey: 'role', header: t('orgs.members.columns.role') },
      { accessorKey: 'status', header: t('orgs.members.columns.status') },
      { accessorKey: 'orgName', header: t('orgs.columns.name') },
    ],
    [t, i18n.language],
  );

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {t('users.title')}
      </Text>
      <Text tone="muted" size="sm">
        {t('users.subtitle')}
      </Text>

      {!activeOrgId && !myOrgs.isLoading ? (
        <Text tone="muted">{t('users.noActiveOrg')}</Text>
      ) : membersQuery.isError ? (
        <Text tone="secondary">{t('orgs.members.loadError')}</Text>
      ) : (
        <AzesTable
          aria-label={t('users.title')}
          columns={columns}
          data={(membersQuery.data?.items ?? []) as OrgMembership[]}
          getRowId={(row) => row.id}
          loading={membersQuery.isLoading || myOrgs.isLoading}
        />
      )}
    </Stack>
  );
}
