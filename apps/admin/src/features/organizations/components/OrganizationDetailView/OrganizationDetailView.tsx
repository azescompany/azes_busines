/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrganizationDetailView/OrganizationDetailView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Org detail — members list + invite form
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { OrgMembership } from '@azes/api/azes/models';
import {
  getGetApiV1OrgsOrgIdInvitationsQueryKey,
  getGetApiV1OrgsOrgIdMembersQueryKey,
  postApiV1OrgsOrgIdInvitations,
  useGetApiV1OrgsOrgId,
  useGetApiV1OrgsOrgIdInvitations,
  useGetApiV1OrgsOrgIdMembers,
} from '@azes/api/azes/orgs';
import { useTranslation } from '@azes/i18n';
import { MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { inviteSchema, type InviteValues } from '../../models/schema.js';

export function OrganizationDetailView() {
  const { orgId = '' } = useParams();
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const queryClient = useQueryClient();
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  const orgQuery = useGetApiV1OrgsOrgId(orgId, { query: { enabled: Boolean(orgId) } });
  const membersQuery = useGetApiV1OrgsOrgIdMembers(orgId, {
    query: { enabled: Boolean(orgId) },
  });
  const invitesQuery = useGetApiV1OrgsOrgIdInvitations(orgId, {
    query: { enabled: Boolean(orgId) },
  });

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'instructor' },
  });

  const memberColumns = useMemo<AzesTableProps<OrgMembership>['columns']>(
    () => [
      { accessorKey: 'username', header: t('orgs.members.columns.user') },
      { accessorKey: 'role', header: t('orgs.members.columns.role') },
      { accessorKey: 'status', header: t('orgs.members.columns.status') },
    ],
    [t, i18n.language],
  );

  const members = (membersQuery.data?.items ?? []) as OrgMembership[];
  const pendingInvites = (invitesQuery.data?.items ?? []).filter((i) => i.status === 'pending');

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {orgQuery.data?.name ?? t('orgs.detailTitle')}
      </Text>
      {orgQuery.data ? (
        <Text tone="muted" size="sm">
          {orgQuery.data.slug} · {orgQuery.data.status}
        </Text>
      ) : null}

      <Text weight="semibold">{t('orgs.members.title')}</Text>
      {membersQuery.isError ? (
        <Text tone="secondary">{t('orgs.members.loadError')}</Text>
      ) : (
        <AzesTable
          aria-label={t('orgs.members.title')}
          columns={memberColumns}
          data={members}
          getRowId={(row) => row.id}
          loading={membersQuery.isLoading}
        />
      )}

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
            setInviteError(null);
            setInviteToken(null);
            setInviting(true);
            try {
              const created = await postApiV1OrgsOrgIdInvitations(orgId, {
                email: values.email.trim(),
                role: values.role,
              });
              form.reset({ email: '', role: 'instructor' });
              setInviteToken(created.token);
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: getGetApiV1OrgsOrgIdInvitationsQueryKey(orgId),
                }),
                queryClient.invalidateQueries({
                  queryKey: getGetApiV1OrgsOrgIdMembersQueryKey(orgId),
                }),
              ]);
            } catch {
              setInviteError(t('orgs.invite.error'));
            } finally {
              setInviting(false);
            }
          }}
        >
          <Stack gap={2}>
            <Text weight="semibold">{t('orgs.invite.title')}</Text>
            <AzesFormTextField name="email" label={t('orgs.invite.email')} fullWidth />
            <AzesFormTextField name="role" label={t('orgs.invite.role')} fullWidth />
            {inviteError ? (
              <Text size="sm" tone="secondary">
                {inviteError}
              </Text>
            ) : null}
            {inviteToken ? (
              <Text size="sm" tone="muted">
                {t('orgs.invite.tokenOnce')}: {inviteToken}
              </Text>
            ) : null}
            <MuiButton type="submit" variant="contained" disabled={inviting || !orgId}>
              {inviting ? t('orgs.invite.sending') : t('orgs.invite.send')}
            </MuiButton>
          </Stack>
        </AzesForm>
      </MuiBox>

      {pendingInvites.length > 0 ? (
        <Stack gap={1}>
          <Text weight="semibold">{t('orgs.invite.pending')}</Text>
          {pendingInvites.map((inv) => (
            <Text key={inv.id} size="sm" tone="muted">
              {inv.email} · {inv.role} · {inv.status}
            </Text>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}
