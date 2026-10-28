/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrganizationDetailView/OrganizationDetailView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Org detail — members, invite, modules, units (Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { OrganizationUnit, OrgMembership } from '@azes/api/azes/models';
import {
  getGetApiV1ModulesQueryKey,
  getGetApiV1OrgsOrgIdModulesQueryKey,
  putApiV1OrgsOrgIdModules,
  useGetApiV1Modules,
  useGetApiV1OrgsOrgIdModules,
} from '@azes/api/azes/modules';
import {
  getGetApiV1OrgsOrgIdInvitationsQueryKey,
  getGetApiV1OrgsOrgIdMembersQueryKey,
  getGetApiV1OrgsOrgIdUnitsQueryKey,
  getGetApiV1OrgsOrgIdUnitsUnitIdMembersQueryKey,
  patchApiV1OrgsOrgId,
  postApiV1OrgsOrgIdInvitations,
  postApiV1OrgsOrgIdUnits,
  putApiV1OrgsOrgIdUnitsUnitIdMembers,
  useGetApiV1OrgsOrgId,
  useGetApiV1OrgsOrgIdInvitations,
  useGetApiV1OrgsOrgIdMembers,
  useGetApiV1OrgsOrgIdUnits,
  useGetApiV1OrgsOrgIdUnitsUnitIdMembers,
} from '@azes/api/azes/orgs';
import { useTranslation } from '@azes/i18n';
import {
  Checkbox,
  FormControlLabel,
  MuiBox,
  MuiButton,
  Stack,
  Text,
  TextField,
} from '@azes/ui-web';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';

import { checkPermission } from '../../../../auth/checkPermission.js';
import { invalidateAccessQueries } from '../../../../auth/invalidateAccessQueries.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { useNotify } from '../../../../shared/adminChrome/index.js';
import { inviteSchema, type InviteValues } from '../../models/schema.js';

const unitCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).max(64),
});
type UnitCreateValues = z.infer<typeof unitCreateSchema>;

export function OrganizationDetailView() {
  const { orgId = '' } = useParams();
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const queryClient = useQueryClient();
  const notify = useNotify();
  const me = useSessionMe();
  const canManageAll = checkPermission(me.data?.permissions, 'org.manage_all');
  const canManageOrg = checkPermission(me.data?.permissions, 'org.manage') || canManageAll;

  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [assignUserId, setAssignUserId] = useState('');
  const [moduleDraft, setModuleDraft] = useState<string[]>([]);
  const [savingModules, setSavingModules] = useState(false);
  const [togglingReadOnly, setTogglingReadOnly] = useState(false);

  const orgQuery = useGetApiV1OrgsOrgId(orgId, { query: { enabled: Boolean(orgId) } });
  const membersQuery = useGetApiV1OrgsOrgIdMembers(orgId, {
    query: { enabled: Boolean(orgId) },
  });
  const invitesQuery = useGetApiV1OrgsOrgIdInvitations(orgId, {
    query: { enabled: Boolean(orgId) },
  });
  const unitsQuery = useGetApiV1OrgsOrgIdUnits(orgId, {
    query: { enabled: Boolean(orgId) && canManageOrg },
  });
  const unitMembersQuery = useGetApiV1OrgsOrgIdUnitsUnitIdMembers(orgId, selectedUnitId, {
    query: { enabled: Boolean(orgId) && Boolean(selectedUnitId) && canManageOrg },
  });
  const platformModulesQuery = useGetApiV1Modules({
    query: { enabled: canManageAll && Boolean(orgId) },
  });
  const orgModulesQuery = useGetApiV1OrgsOrgIdModules(orgId, {
    query: { enabled: canManageAll && Boolean(orgId) },
  });

  useEffect(() => {
    if (orgModulesQuery.data?.moduleIds) {
      setModuleDraft([...orgModulesQuery.data.moduleIds]);
    }
  }, [orgModulesQuery.data?.moduleIds]);

  useEffect(() => {
    const items = unitsQuery.data?.items ?? [];
    if (!selectedUnitId && items[0]) setSelectedUnitId(items[0].id);
  }, [unitsQuery.data?.items, selectedUnitId]);

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'instructor' },
  });

  const unitForm = useForm<UnitCreateValues>({
    resolver: zodResolver(unitCreateSchema),
    defaultValues: { name: '', code: '' },
  });

  const memberColumns = useMemo<AzesTableProps<OrgMembership>['columns']>(
    () => [
      { accessorKey: 'username', header: t('orgs.members.columns.user') },
      { accessorKey: 'role', header: t('orgs.members.columns.role') },
      { accessorKey: 'status', header: t('orgs.members.columns.status') },
    ],
    [t, i18n.language],
  );

  const unitColumns = useMemo<AzesTableProps<OrganizationUnit>['columns']>(
    () => [
      { accessorKey: 'name', header: t('orgs.units.columns.name') },
      { accessorKey: 'code', header: t('orgs.units.columns.code') },
      { accessorKey: 'kind', header: t('orgs.units.columns.kind') },
      { accessorKey: 'status', header: t('orgs.units.columns.status') },
    ],
    [t, i18n.language],
  );

  const members = (membersQuery.data?.items ?? []) as OrgMembership[];
  const units = (unitsQuery.data?.items ?? []) as OrganizationUnit[];
  const pendingInvites = (invitesQuery.data?.items ?? []).filter((i) => i.status === 'pending');
  const platformModules = platformModulesQuery.data?.items ?? [];
  const readOnly = Boolean(orgQuery.data?.subscriptionReadOnly);

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {orgQuery.data?.name ?? t('orgs.detailTitle')}
      </Text>
      {orgQuery.data ? (
        <Stack gap={1}>
          <Text tone="muted" size="sm">
            {orgQuery.data.slug} · {orgQuery.data.status}
            {orgQuery.data.subscriptionStatus
              ? ` · ${
                  orgQuery.data.subscriptionStatus === 'blocked'
                    ? t('orgs.subscription.blocked')
                    : t('orgs.subscription.active')
                }`
              : ''}
            {readOnly ? ` · ${t('orgs.subscription.readOnly')}` : ''}
          </Text>
          {canManageAll ? (
            <MuiButton
              size="small"
              variant="outlined"
              disabled={togglingReadOnly || !orgId}
              onClick={() => {
                setTogglingReadOnly(true);
                void (async () => {
                  try {
                    await patchApiV1OrgsOrgId(orgId, {
                      subscriptionReadOnly: !readOnly,
                    });
                    await orgQuery.refetch();
                    await invalidateAccessQueries(queryClient);
                    notify.success(
                      readOnly
                        ? t('orgs.subscription.readOnlyOff')
                        : t('orgs.subscription.readOnlyOn'),
                    );
                  } catch {
                    notify.error(t('orgs.loadError'));
                  } finally {
                    setTogglingReadOnly(false);
                  }
                })();
              }}
            >
              {readOnly ? t('orgs.actions.clearReadOnly') : t('orgs.actions.setReadOnly')}
            </MuiButton>
          ) : null}
        </Stack>
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

      {canManageAll ? (
        <MuiBox
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
          }}
        >
          <Stack gap={2}>
            <Text weight="semibold">{t('orgs.modules.title')}</Text>
            <Text size="sm" tone="muted">
              {t('orgs.modules.hint')}
            </Text>
            {platformModulesQuery.isLoading || orgModulesQuery.isLoading ? (
              <AzesSkeleton shape="rect" height={120} width="100%" />
            ) : (
              <Stack gap={1}>
                {platformModules.map((mod) => (
                  <FormControlLabel
                    key={mod.id}
                    control={
                      <Checkbox
                        checked={moduleDraft.includes(mod.id)}
                        onChange={(_, next) => {
                          setModuleDraft((prev) =>
                            next ? [...prev, mod.id] : prev.filter((id) => id !== mod.id),
                          );
                        }}
                      />
                    }
                    label={`${mod.name} (${mod.code})`}
                  />
                ))}
              </Stack>
            )}
            <MuiButton
              variant="contained"
              disabled={savingModules || !orgId}
              onClick={() => {
                setSavingModules(true);
                void (async () => {
                  try {
                    await putApiV1OrgsOrgIdModules(orgId, { moduleIds: moduleDraft });
                    await Promise.all([
                      queryClient.invalidateQueries({
                        queryKey: getGetApiV1OrgsOrgIdModulesQueryKey(orgId),
                      }),
                      queryClient.invalidateQueries({
                        queryKey: getGetApiV1ModulesQueryKey(),
                      }),
                      invalidateAccessQueries(queryClient),
                    ]);
                    notify.success(t('orgs.modules.saved'));
                  } catch {
                    notify.error(t('orgs.modules.saveError'));
                  } finally {
                    setSavingModules(false);
                  }
                })();
              }}
            >
              {savingModules ? t('orgs.modules.saving') : t('orgs.modules.save')}
            </MuiButton>
          </Stack>
        </MuiBox>
      ) : null}

      {canManageOrg ? (
        <Stack gap={2}>
          <Text weight="semibold">{t('orgs.units.title')}</Text>
          <Text size="sm" tone="muted">
            {t('orgs.units.hint')}
          </Text>
          {unitsQuery.isError ? (
            <Text tone="secondary">{t('orgs.units.loadError')}</Text>
          ) : (
            <AzesTable
              aria-label={t('orgs.units.title')}
              columns={unitColumns}
              data={units}
              getRowId={(row) => row.id}
              loading={unitsQuery.isLoading}
              onRowClick={(row) => setSelectedUnitId(row.id)}
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
              form={unitForm}
              onSubmit={async (values) => {
                try {
                  await postApiV1OrgsOrgIdUnits(orgId, {
                    name: values.name.trim(),
                    code: values.code.trim(),
                  });
                  unitForm.reset({ name: '', code: '' });
                  await queryClient.invalidateQueries({
                    queryKey: getGetApiV1OrgsOrgIdUnitsQueryKey(orgId),
                  });
                  notify.success(t('orgs.units.created'));
                } catch {
                  notify.error(t('orgs.units.createError'));
                }
              }}
            >
              <Stack gap={2}>
                <Text weight="semibold">{t('orgs.units.createTitle')}</Text>
                <AzesFormTextField name="name" label={t('orgs.units.fields.name')} fullWidth />
                <AzesFormTextField name="code" label={t('orgs.units.fields.code')} fullWidth />
                <MuiButton type="submit" variant="contained" disabled={!orgId}>
                  {t('orgs.units.create')}
                </MuiButton>
              </Stack>
            </AzesForm>
          </MuiBox>

          {selectedUnitId ? (
            <MuiBox
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                maxWidth: 480,
              }}
            >
              <Stack gap={2}>
                <Text weight="semibold">{t('orgs.units.membersTitle')}</Text>
                {unitMembersQuery.isLoading ? (
                  <AzesSkeleton shape="rect" height={80} width="100%" />
                ) : (
                  <Stack gap={1}>
                    {(unitMembersQuery.data?.items ?? []).map((m) => (
                      <Text key={m.id} size="sm" tone="muted">
                        {m.userId} · {m.role} · {m.status}
                      </Text>
                    ))}
                    {(unitMembersQuery.data?.items ?? []).length === 0 ? (
                      <Text size="sm" tone="muted">
                        {t('orgs.units.noMembers')}
                      </Text>
                    ) : null}
                  </Stack>
                )}
                <TextField
                  label={t('orgs.units.fields.userId')}
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  fullWidth
                />
                <MuiButton
                  variant="outlined"
                  disabled={!assignUserId.trim() || !selectedUnitId}
                  onClick={() => {
                    void (async () => {
                      try {
                        await putApiV1OrgsOrgIdUnitsUnitIdMembers(orgId, selectedUnitId, {
                          userId: assignUserId.trim(),
                          role: 'member',
                        });
                        setAssignUserId('');
                        await queryClient.invalidateQueries({
                          queryKey: getGetApiV1OrgsOrgIdUnitsUnitIdMembersQueryKey(
                            orgId,
                            selectedUnitId,
                          ),
                        });
                        await invalidateAccessQueries(queryClient);
                        notify.success(t('orgs.units.memberAssigned'));
                      } catch {
                        notify.error(t('orgs.units.assignError'));
                      }
                    })();
                  }}
                >
                  {t('orgs.units.assign')}
                </MuiButton>
              </Stack>
            </MuiBox>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}
