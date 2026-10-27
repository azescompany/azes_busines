/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/platformRoles/components/PlatformRolesView/PlatformRolesView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Platform roles — Dialog create, Menu actions
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  deleteApiV1PlatformRolesRoleId,
  getGetApiV1PlatformRolesQueryKey,
  postApiV1PlatformRoles,
  useGetApiV1PlatformRoles,
} from '@azes/api/azes/platform-roles';
import type { PlatformRole } from '@azes/api/azes/models';
import { useTranslation } from '@azes/i18n';
import { Chip, IconButton, MuiBox, MuiButton, Stack, Text, Tooltip } from '@azes/ui-web';
import { useAzesDialog } from '@azes/ui-web/feedback';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { IconAdd, IconLock, IconMore, IconSecurity } from '@azes/ui-web/icons';
import { AzesMenu, type AzesMenuItem } from '@azes/ui-web/menu';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import { pathTo, PATHS } from '../../../../app/router/paths.js';
import { checkPermission } from '../../../../auth/checkPermission.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import {
  EmptyState,
  FilterToolbar,
  PageHeader,
  useNotify,
} from '../../../../shared/adminChrome/index.js';

const createSchema = z.object({
  name: z.string().min(2, 'platformRoles.validation.nameRequired'),
});
type CreateValues = z.infer<typeof createSchema>;

function RoleCreateDialogForm({ onDone }: { onDone: (ok: boolean) => void }) {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const notify = useNotify();
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '' },
  });

  return (
    <AzesForm
      form={form}
      onSubmit={async (values) => {
        setError(null);
        setCreating(true);
        try {
          await postApiV1PlatformRoles({ name: values.name.trim() });
          notify.success(t('platformRoles.dialog.created'));
          onDone(true);
        } catch {
          setError(t('platformRoles.createError'));
          notify.error(t('platformRoles.createError'));
        } finally {
          setCreating(false);
        }
      }}
    >
      <MuiBox sx={{ pt: 1 }}>
        <Stack gap={2}>
          <AzesFormTextField
            name="name"
            label={t('platformRoles.fields.name')}
            fullWidth
            autoFocus
          />
          {error ? (
            <Text size="sm" tone="secondary">
              {error}
            </Text>
          ) : null}
          <Stack direction="row" gap={1} justify="flex-end">
            <MuiButton type="button" variant="text" onClick={() => onDone(false)}>
              {t('chrome.actions.cancel')}
            </MuiButton>
            <MuiButton type="submit" variant="contained" disabled={creating}>
              {creating ? t('platformRoles.creating') : t('chrome.actions.create')}
            </MuiButton>
          </Stack>
        </Stack>
      </MuiBox>
    </AzesForm>
  );
}

export function PlatformRolesView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navigate = useNavigate();
  const me = useSessionMe();
  const canManage = checkPermission(me.data?.permissions, 'org.manage_all');
  const queryClient = useQueryClient();
  const dialog = useAzesDialog();
  const notify = useNotify();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const listQuery = useGetApiV1PlatformRoles({ query: { enabled: canManage } });
  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';

  const rows = useMemo(() => {
    const items = (listQuery.data?.items ?? []) as PlatformRole[];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.name.toLowerCase().includes(q));
  }, [listQuery.data, search]);

  const openCreate = useCallback(() => {
    void dialog.open({
      variant: 'custom',
      title: t('platformRoles.dialog.title'),
      icon: false,
      hideFooter: true,
      showCloseButton: true,
      maxWidth: 'xs',
      content: (
        <RoleCreateDialogForm
          onDone={async (ok) => {
            dialog.close();
            if (ok) {
              await queryClient.invalidateQueries({
                queryKey: getGetApiV1PlatformRolesQueryKey(),
              });
            }
          }}
        />
      ),
    });
  }, [dialog, t, queryClient]);

  const deleteRole = useCallback(
    async (role: PlatformRole) => {
      const ok = await dialog.danger({
        title: t('platformRoles.confirmDelete.title'),
        description: t('platformRoles.confirmDelete.description', { name: role.name }),
        confirmLabel: t('platformRoles.actions.delete'),
      });
      if (!ok) return;
      setDeletingId(role.id);
      try {
        await deleteApiV1PlatformRolesRoleId(role.id);
        await queryClient.invalidateQueries({
          queryKey: getGetApiV1PlatformRolesQueryKey(),
        });
        notify.success(t('platformRoles.dialog.deleted'));
      } catch {
        notify.error(t('platformRoles.createError'));
      } finally {
        setDeletingId(null);
      }
    },
    [dialog, t, queryClient, notify],
  );

  const columns = useMemo<AzesTableProps<PlatformRole>['columns']>(
    () => [
      { accessorKey: 'name', header: t('platformRoles.columns.name') },
      {
        id: 'system',
        header: t('platformRoles.columns.system'),
        cell: ({ row }) =>
          row.original.system ? (
            <Tooltip title={t('platformRoles.systemTooltip')}>
              <Chip size="small" label={t('platformRoles.systemYes')} color="default" />
            </Tooltip>
          ) : (
            <Chip size="small" variant="outlined" label={t('platformRoles.systemNo')} />
          ),
      },
      {
        id: 'actions',
        header: t('platformRoles.columns.actions'),
        cell: ({ row }) => {
          const role = row.original;
          const items: AzesMenuItem[] = [
            {
              id: 'menus',
              label: t('platformRoles.actions.menus'),
              onSelect: () => navigate(pathTo(PATHS.roleMenus, locale)),
            },
          ];
          if (!role.system) {
            items.push(
              { type: 'divider', id: 'div-del' },
              {
                id: 'delete',
                label: t('platformRoles.actions.delete'),
                danger: true,
                disabled: deletingId === role.id,
                onSelect: () => void deleteRole(role),
              },
            );
          }
          return (
            <AzesMenu
              aria-label={t('chrome.actions.more')}
              placement="bottom-end"
              items={items}
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
          );
        },
      },
    ],
    [t, locale, deletingId, queryClient, navigate, deleteRole],
  );

  if (me.isLoading) {
    return <AzesSkeleton shape="rect" height={200} width="100%" />;
  }

  if (!canManage) {
    return (
      <Stack gap={3}>
        <PageHeader
          title={t('platformRoles.title')}
          startAdornment={<IconSecurity color="primary" />}
        />
        <EmptyState
          icon={<IconLock fontSize="inherit" />}
          title={t('platformRoles.forbidden')}
          description={t('chrome.empty.forbiddenHint')}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <PageHeader
        title={t('platformRoles.title')}
        subtitle={t('platformRoles.subtitle')}
        startAdornment={<IconSecurity color="primary" />}
        actions={
          <MuiButton variant="contained" startIcon={<IconAdd />} onClick={openCreate}>
            {t('chrome.actions.create')}
          </MuiButton>
        }
      />

      <FilterToolbar
        searchLabel={t('chrome.filters.search')}
        searchValue={search}
        onSearchChange={setSearch}
        clearLabel={t('chrome.filters.clear')}
        onClear={() => setSearch('')}
      />

      {listQuery.isError ? (
        <Text tone="secondary">{t('platformRoles.loadError')}</Text>
      ) : !listQuery.isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<IconSecurity fontSize="inherit" />}
          title={t('chrome.empty.title')}
          description={t('platformRoles.empty.description')}
          action={
            <MuiButton variant="contained" startIcon={<IconAdd />} onClick={openCreate}>
              {t('chrome.actions.create')}
            </MuiButton>
          }
        />
      ) : (
        <MuiBox sx={{ overflowX: 'auto' }}>
          <AzesTable
            aria-label={t('platformRoles.title')}
            columns={columns}
            data={rows}
            getRowId={(row) => row.id}
            loading={listQuery.isLoading}
          />
        </MuiBox>
      )}
    </Stack>
  );
}
