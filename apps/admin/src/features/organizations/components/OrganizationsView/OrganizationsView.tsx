/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrganizationsView/OrganizationsView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Organizations list — SuperAdmin full list; others own memberships
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  getGetApiV1OrgsQueryKey,
  postApiV1Orgs,
  useGetApiV1MeOrganizations,
  useGetApiV1Orgs,
} from '@azes/api/azes/orgs';
import type { Organization } from '@azes/api/azes/models';
import { useTranslation } from '@azes/i18n';
import { MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { organizationDetailPath, pathTo } from '../../../../app/router/paths.js';
import { checkPermission } from '../../../../auth/checkPermission.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { orgCreateSchema, type OrgCreateValues } from '../../models/schema.js';

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

export function OrganizationsView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const meQuery = useSessionMe();
  const permissions = meQuery.data?.permissions ?? [];
  const canManageAll = checkPermission(permissions, 'org.manage_all');
  const canCreate = checkPermission(permissions, 'org.create');

  const orgsQuery = useGetApiV1Orgs({
    query: { enabled: canManageAll },
  });
  const myOrgsQuery = useGetApiV1MeOrganizations({
    query: { enabled: meQuery.isSuccess && !canManageAll },
  });

  const rows = useMemo<OrgRow[]>(() => {
    if (canManageAll) {
      return ((orgsQuery.data?.items ?? []) as Organization[]).map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        status: o.status,
      }));
    }
    return (myOrgsQuery.data?.items ?? []).map((o) => ({
      id: o.orgId,
      name: o.name,
      slug: o.slug,
      status: o.status,
    }));
  }, [canManageAll, orgsQuery.data, myOrgsQuery.data]);

  const listLoading = canManageAll
    ? orgsQuery.isLoading || meQuery.isLoading
    : myOrgsQuery.isLoading || meQuery.isLoading;
  const listError = canManageAll ? orgsQuery.isError : myOrgsQuery.isError;

  const form = useForm<OrgCreateValues>({
    resolver: zodResolver(orgCreateSchema),
    defaultValues: { name: '', slug: '' },
  });

  const columns = useMemo<AzesTableProps<OrgRow>['columns']>(
    () => [
      { accessorKey: 'name', header: t('orgs.columns.name') },
      { accessorKey: 'slug', header: t('orgs.columns.slug') },
      { accessorKey: 'status', header: t('orgs.columns.status') },
    ],
    [t, i18n.language],
  );

  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {t('orgs.title')}
      </Text>
      <Text tone="muted" size="sm">
        {canManageAll ? t('orgs.subtitle') : t('orgs.subtitleMember')}
      </Text>

      {canCreate ? (
        <MuiBox
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            maxWidth: 480,
          }}
        >
          <AzesForm
            form={form}
            onSubmit={async (values) => {
              setCreateError(null);
              setCreating(true);
              try {
                const created = await postApiV1Orgs({
                  name: values.name.trim(),
                  ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
                });
                form.reset({ name: '', slug: '' });
                await queryClient.invalidateQueries({ queryKey: getGetApiV1OrgsQueryKey() });
                navigate(pathTo(organizationDetailPath(created.id), locale));
              } catch {
                setCreateError(t('orgs.createError'));
              } finally {
                setCreating(false);
              }
            }}
          >
            <Stack gap={2}>
              <Text weight="semibold">{t('orgs.createTitle')}</Text>
              <AzesFormTextField name="name" label={t('orgs.fields.name')} fullWidth />
              <AzesFormTextField name="slug" label={t('orgs.fields.slug')} fullWidth />
              {createError ? (
                <Text size="sm" tone="secondary">
                  {createError}
                </Text>
              ) : null}
              <MuiButton type="submit" variant="contained" disabled={creating}>
                {creating ? t('orgs.creating') : t('orgs.create')}
              </MuiButton>
            </Stack>
          </AzesForm>
        </MuiBox>
      ) : null}

      {listError ? (
        <Text tone="secondary">{t('orgs.loadError')}</Text>
      ) : (
        <AzesTable
          aria-label={t('orgs.title')}
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          loading={listLoading}
          onRowClick={(row) => {
            navigate(pathTo(organizationDetailPath(row.id), locale));
          }}
        />
      )}
    </Stack>
  );
}
