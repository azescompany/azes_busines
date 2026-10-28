/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/UsersView/UsersView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Platform users — SidePanel create, Menu, toolbar
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { isAzesApiError } from '@azes/api';
import type { PlatformUser } from '@azes/api/azes/models';
import { getGetApiV1UsersQueryKey, postApiV1Users, useGetApiV1Users } from '@azes/api/azes/users';
import { useGetApiV1MeOrganizations, useGetApiV1Orgs } from '@azes/api/azes/orgs';
import { useGetApiV1PlatformRoles } from '@azes/api/azes/platform-roles';
import { useTranslation } from '@azes/i18n';
import { Chip, IconButton, MuiBox, MuiButton, Stack, Text, TextField } from '@azes/ui-web';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { IconAdd, IconLock, IconMore, IconPeople } from '@azes/ui-web/icons';
import { AzesMenu } from '@azes/ui-web/menu';
import { AzesSidePanel, useSidePanel } from '@azes/ui-web/side-panel';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { pathTo, userAccessPath } from '../../../../app/router/paths.js';
import { checkPermission } from '../../../../auth/checkPermission.js';
import { invalidateAccessQueries } from '../../../../auth/invalidateAccessQueries.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import {
  EmptyState,
  FilterToolbar,
  OrgColorDot,
  PageHeader,
  UserAvatar,
  useNotify,
} from '../../../../shared/adminChrome/index.js';
import { userCreateSchema, type UserCreateValues } from '../../models/schema.js';

type OrgOption = { id: string; name: string };

function apiErrorCode(error: unknown): string | null {
  if (!isAzesApiError(error) || !error.body || typeof error.body !== 'object') return null;
  const envelope = error.body as { error?: { code?: unknown } };
  return typeof envelope.error?.code === 'string' ? envelope.error.code : null;
}

export function UsersView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const createPanel = useSidePanel('adminUserCreate');
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const meQuery = useSessionMe();
  const permissions = meQuery.data?.permissions ?? [];
  const canManage = checkPermission(permissions, 'org.manage');
  const canManageAll = checkPermission(permissions, 'org.manage_all');

  const usersQuery = useGetApiV1Users(undefined, {
    query: { enabled: canManage && meQuery.isSuccess },
  });
  const orgsQuery = useGetApiV1Orgs({
    query: { enabled: canManageAll },
  });
  const myOrgsQuery = useGetApiV1MeOrganizations({
    query: { enabled: meQuery.isSuccess && !canManageAll },
  });
  const rolesQuery = useGetApiV1PlatformRoles({
    query: { enabled: canManageAll },
  });

  const orgOptions = useMemo<OrgOption[]>(() => {
    if (canManageAll) {
      return (orgsQuery.data?.items ?? []).map((o) => ({ id: o.id, name: o.name }));
    }
    return (myOrgsQuery.data?.items ?? []).map((o) => ({ id: o.orgId, name: o.name }));
  }, [canManageAll, orgsQuery.data, myOrgsQuery.data]);

  const roleOptions = useMemo(() => {
    const items = rolesQuery.data?.items ?? [];
    return items
      .filter((r: { name: string }) => r.name !== 'superAdmin')
      .map((r: { name: string }) => r.name);
  }, [rolesQuery.data]);

  const form = useForm<UserCreateValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      username: '',
      password: '',
      orgId: '',
      roleName: canManageAll ? 'orgAdmin' : 'member',
    },
  });

  const isDirty = form.formState.isDirty;

  const roleLabel = useCallback(
    (roleName: string): string => {
      const key = `users.roles.${roleName}`;
      const translated = t(key);
      return translated === key ? roleName : translated;
    },
    [t],
  );

  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';

  const allUsers = (usersQuery.data?.items ?? []) as PlatformUser[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (orgFilter && u.orgId !== orgFilter && u.orgName !== orgFilter) return false;
      if (roleFilter && u.roleName !== roleFilter) return false;
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        (u.orgName ?? '').toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q)
      );
    });
  }, [allUsers, search, orgFilter, roleFilter]);

  const goAccess = useCallback(
    (userId: string) => {
      navigate(pathTo(userAccessPath(userId), locale));
    },
    [navigate, locale],
  );

  const columns = useMemo<AzesTableProps<PlatformUser>['columns']>(
    () => [
      {
        id: 'user',
        header: t('users.columns.username'),
        cell: ({ row }) => (
          <Stack direction="row" gap={1} align="center">
            <UserAvatar name={row.original.username} colorCode={row.original.orgColorCode} />
            <Text size="sm">{row.original.username}</Text>
          </Stack>
        ),
      },
      {
        id: 'roleName',
        header: t('users.columns.role'),
        cell: ({ row }) => <Chip size="small" label={roleLabel(row.original.roleName)} />,
      },
      {
        id: 'org',
        header: t('users.columns.org'),
        cell: ({ row }) => (
          <Stack direction="row" gap={1} align="center">
            <OrgColorDot colorCode={row.original.orgColorCode} />
            <Text size="sm">{row.original.orgName}</Text>
          </Stack>
        ),
      },
      {
        id: 'status',
        header: t('users.columns.status'),
        cell: ({ row }) => {
          const s = row.original.status;
          if (s === 'disabled') return t('users.status.disabled');
          if (s === 'pending') return t('users.status.pending');
          return t('users.status.active');
        },
      },
      {
        id: 'actions',
        header: t('users.columns.actions'),
        cell: ({ row }) => (
          <MuiBox onClick={(e) => e.stopPropagation()}>
            <AzesMenu
              aria-label={t('chrome.actions.more')}
              placement="bottom-end"
              items={[
                {
                  id: 'access',
                  label: t('users.actions.access'),
                  onSelect: () => goAccess(row.original.id),
                },
              ]}
              trigger={({ props, onClick }) => (
                <IconButton
                  {...props}
                  size="small"
                  onClick={onClick}
                  aria-label={t('chrome.actions.more')}
                >
                  <IconMore fontSize="small" />
                </IconButton>
              )}
            />
          </MuiBox>
        ),
      },
    ],
    [t, roleLabel, goAccess],
  );

  const resetForm = useCallback(() => {
    form.reset({
      username: '',
      password: '',
      orgId: '',
      roleName: canManageAll ? 'orgAdmin' : 'member',
    });
    setCreateError(null);
  }, [form, canManageAll]);

  const filterChips = useMemo(() => {
    const chips = [];
    if (orgFilter) {
      const orgName = orgOptions.find((o) => o.id === orgFilter)?.name ?? orgFilter;
      chips.push({
        id: 'org',
        label: orgName,
        onDelete: () => setOrgFilter(''),
      });
    }
    if (roleFilter) {
      chips.push({
        id: 'role',
        label: roleLabel(roleFilter),
        onDelete: () => setRoleFilter(''),
      });
    }
    return chips;
  }, [orgFilter, roleFilter, orgOptions, roleLabel]);

  if (!canManage && meQuery.isSuccess) {
    return (
      <Stack gap={3}>
        <PageHeader title={t('users.title')} startAdornment={<IconPeople color="primary" />} />
        <EmptyState
          icon={<IconLock fontSize="inherit" />}
          title={t('users.forbidden')}
          description={t('chrome.empty.forbiddenHint')}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <PageHeader
        title={t('users.title')}
        subtitle={canManageAll ? t('users.subtitleSuper') : t('users.subtitleAdmin')}
        startAdornment={<IconPeople color="primary" />}
        actions={
          canManage ? (
            <MuiButton
              variant="contained"
              startIcon={<IconAdd />}
              onClick={() => void createPanel.open()}
            >
              {t('chrome.actions.create')}
            </MuiButton>
          ) : undefined
        }
      />

      <FilterToolbar
        searchLabel={t('chrome.filters.search')}
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <>
            <TextField
              select
              size="small"
              slotProps={{ select: { native: true } }}
              label={t('users.filters.org')}
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <option value="">{t('users.filters.orgAll')}</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </TextField>
            {canManageAll ? (
              <TextField
                select
                size="small"
                slotProps={{ select: { native: true } }}
                label={t('users.filters.role')}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <option value="">{t('users.filters.roleAll')}</option>
                {(roleOptions.length > 0 ? roleOptions : (['orgAdmin', 'member'] as string[])).map(
                  (name) => (
                    <option key={name} value={name}>
                      {roleLabel(name)}
                    </option>
                  ),
                )}
              </TextField>
            ) : null}
          </>
        }
        chips={filterChips}
        clearLabel={t('chrome.filters.clear')}
        onClear={() => {
          setSearch('');
          setOrgFilter('');
          setRoleFilter('');
        }}
      />

      {usersQuery.isError ? (
        <Text tone="secondary">{t('users.loadError')}</Text>
      ) : !usersQuery.isLoading && !meQuery.isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<IconPeople fontSize="inherit" />}
          title={t('chrome.empty.title')}
          description={t('users.empty.description')}
          action={
            canManage ? (
              <MuiButton
                variant="contained"
                startIcon={<IconAdd />}
                onClick={() => void createPanel.open()}
              >
                {t('chrome.actions.create')}
              </MuiButton>
            ) : undefined
          }
        />
      ) : (
        <MuiBox sx={{ overflowX: 'auto' }}>
          <AzesTable
            aria-label={t('users.title')}
            columns={columns}
            data={filtered}
            getRowId={(row) => row.id}
            loading={usersQuery.isLoading || meQuery.isLoading}
          />
        </MuiBox>
      )}

      <AzesSidePanel
        id="adminUserCreate"
        title={t('users.drawer.title')}
        subtitle={t('users.drawer.subtitle')}
        width="lg"
        isDirty={isDirty}
        onClose={resetForm}
        footer={
          <Stack direction="row" gap={1} justify="flex-end">
            <MuiButton
              variant="text"
              onClick={() => {
                resetForm();
                void createPanel.close();
              }}
            >
              {t('chrome.actions.cancel')}
            </MuiButton>
            <MuiButton
              variant="contained"
              disabled={creating}
              onClick={() =>
                void form.handleSubmit(async (values) => {
                  setCreateError(null);
                  setCreating(true);
                  try {
                    await postApiV1Users({
                      username: values.username.trim(),
                      password: values.password,
                      orgId: values.orgId,
                      ...(canManageAll && values.roleName ? { roleName: values.roleName } : {}),
                    });
                    resetForm();
                    await queryClient.invalidateQueries({ queryKey: getGetApiV1UsersQueryKey() });
                    await invalidateAccessQueries(queryClient);
                    notify.success(t('users.drawer.created'));
                    void createPanel.close();
                  } catch (err) {
                    const code = apiErrorCode(err);
                    if (code === 'CONFLICT' || (isAzesApiError(err) && err.status === 409)) {
                      setCreateError(t('users.createConflict'));
                      notify.warning(t('users.createConflict'));
                    } else {
                      setCreateError(t('users.createError'));
                      notify.error(t('users.createError'));
                    }
                  } finally {
                    setCreating(false);
                  }
                })()
              }
            >
              {creating ? t('users.creating') : t('chrome.actions.create')}
            </MuiButton>
          </Stack>
        }
      >
        <AzesForm form={form} onSubmit={() => undefined}>
          <MuiBox sx={{ p: 2 }}>
            <Stack gap={2}>
              <AzesFormTextField name="username" label={t('users.fields.username')} fullWidth />
              <AzesFormTextField
                name="password"
                label={t('users.fields.password')}
                type="password"
                fullWidth
              />
              <TextField
                select
                slotProps={{ select: { native: true } }}
                label={t('users.fields.org')}
                value={form.watch('orgId')}
                onChange={(e) =>
                  form.setValue('orgId', e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                fullWidth
              >
                <option value="">{t('users.fields.orgPlaceholder')}</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </TextField>
              {canManageAll ? (
                <TextField
                  select
                  slotProps={{ select: { native: true } }}
                  label={t('users.fields.role')}
                  value={form.watch('roleName') ?? 'member'}
                  onChange={(e) =>
                    form.setValue('roleName', e.target.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  fullWidth
                >
                  {(roleOptions.length > 0
                    ? roleOptions
                    : (['orgAdmin', 'member'] as string[])
                  ).map((name: string) => (
                    <option key={name} value={name}>
                      {roleLabel(name)}
                    </option>
                  ))}
                </TextField>
              ) : (
                <Text size="sm" tone="muted">
                  {t('users.roleForcedMember')}
                </Text>
              )}
              {createError ? (
                <Text size="sm" tone="secondary">
                  {createError}
                </Text>
              ) : null}
            </Stack>
          </MuiBox>
        </AzesForm>
      </AzesSidePanel>
    </Stack>
  );
}
