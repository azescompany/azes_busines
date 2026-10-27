/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrganizationsView/OrganizationsView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Organizations list — subscription lite + read-only (Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  getGetApiV1OrgsQueryKey,
  patchApiV1OrgsOrgId,
  postApiV1Orgs,
  useGetApiV1MeOrganizations,
  useGetApiV1Orgs,
} from '@azes/api/azes/orgs';
import type { Organization } from '@azes/api/azes/models';
import { useTranslation } from '@azes/i18n';
import { Chip, IconButton, MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { useAzesDialog } from '@azes/ui-web/feedback';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { IconAdd, IconBusiness, IconMore } from '@azes/ui-web/icons';
import { AzesMenu } from '@azes/ui-web/menu';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { organizationDetailPath, pathTo, PATHS } from '../../../../app/router/paths.js';
import { checkPermission } from '../../../../auth/checkPermission.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import {
  EmptyState,
  FilterToolbar,
  OrgColorDot,
  PageHeader,
  useNotify,
} from '../../../../shared/adminChrome/index.js';
import { ORG_COLOR_PALETTE } from '../../models/orgColors.js';
import { orgCreateSchema, type OrgCreateValues } from '../../models/schema.js';

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string;
  colorCode: string;
  subscriptionStatus: string;
  subscriptionReadOnly: boolean;
  trialEndsAtSec: number | null;
};

function trialRelativeLabel(
  sec: number | null,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  if (!sec) return '—';
  const days = Math.ceil((sec * 1000 - Date.now()) / 86_400_000);
  if (days < 0) return t('orgs.trialRelative.expired');
  if (days === 0) return t('orgs.trialRelative.today');
  return t('orgs.trialRelative.days', { count: days });
}

function OrgCreateDialogForm({ onDone }: { onDone: (createdId: string | null) => void }) {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const notify = useNotify();
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const form = useForm<OrgCreateValues>({
    resolver: zodResolver(orgCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      colorCode: ORG_COLOR_PALETTE[0],
      subscriptionStatus: 'active',
      slug: '',
    },
  });
  const selectedColor = form.watch('colorCode') ?? ORG_COLOR_PALETTE[0];
  const selectedSub = form.watch('subscriptionStatus') ?? 'active';

  return (
    <AzesForm
      form={form}
      onSubmit={async (values) => {
        setCreateError(null);
        setCreating(true);
        try {
          const created = await postApiV1Orgs({
            name: values.name.trim(),
            ...(values.description?.trim() ? { description: values.description.trim() } : {}),
            ...(values.colorCode ? { colorCode: values.colorCode } : {}),
            ...(values.subscriptionStatus ? { subscriptionStatus: values.subscriptionStatus } : {}),
            ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
          });
          notify.success(t('orgs.dialog.created'));
          onDone(created.id);
        } catch {
          setCreateError(t('orgs.createError'));
          notify.error(t('orgs.createError'));
        } finally {
          setCreating(false);
        }
      }}
    >
      <MuiBox sx={{ pt: 1 }}>
        <Stack gap={2}>
          <AzesFormTextField name="name" label={t('orgs.fields.name')} fullWidth autoFocus />
          <AzesFormTextField
            name="description"
            label={t('orgs.fields.description')}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack gap={1}>
            <Text size="sm">{t('orgs.fields.color')}</Text>
            <Stack direction="row" gap={1} wrap>
              {ORG_COLOR_PALETTE.map((code) => (
                <MuiButton
                  key={code}
                  type="button"
                  size="small"
                  variant={selectedColor === code ? 'contained' : 'outlined'}
                  onClick={() => form.setValue('colorCode', code)}
                  sx={{
                    minWidth: 36,
                    width: 36,
                    height: 36,
                    p: 0,
                    bgcolor: selectedColor === code ? code : 'transparent',
                    borderColor: code,
                    '&:hover': { bgcolor: code, opacity: 0.85 },
                  }}
                  aria-label={code}
                />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" gap={1}>
            <MuiButton
              type="button"
              size="small"
              variant={selectedSub === 'active' ? 'contained' : 'outlined'}
              onClick={() => form.setValue('subscriptionStatus', 'active')}
            >
              {t('orgs.subscription.active')}
            </MuiButton>
            <MuiButton
              type="button"
              size="small"
              variant={selectedSub === 'blocked' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => form.setValue('subscriptionStatus', 'blocked')}
            >
              {t('orgs.subscription.blocked')}
            </MuiButton>
          </Stack>
          <Text size="sm" tone="muted">
            {t('orgs.trialHint')}
          </Text>
          {createError ? (
            <Text size="sm" tone="secondary">
              {createError}
            </Text>
          ) : null}
          <Stack direction="row" gap={1} justify="flex-end">
            <MuiButton type="button" variant="text" onClick={() => onDone(null)}>
              {t('chrome.actions.cancel')}
            </MuiButton>
            <MuiButton type="submit" variant="contained" disabled={creating}>
              {creating ? t('orgs.creating') : t('chrome.actions.create')}
            </MuiButton>
          </Stack>
        </Stack>
      </MuiBox>
    </AzesForm>
  );
}

export function OrganizationsView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dialog = useAzesDialog();
  const notify = useNotify();
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'active' | 'blocked'>('all');

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
        description: o.description ?? '',
        colorCode: o.colorCode ?? ORG_COLOR_PALETTE[0],
        subscriptionStatus: o.subscriptionStatus ?? 'active',
        subscriptionReadOnly: Boolean(o.subscriptionReadOnly),
        trialEndsAtSec: o.trialEndsAt ?? null,
      }));
    }
    return (myOrgsQuery.data?.items ?? []).map((o) => ({
      id: o.orgId,
      name: o.name,
      slug: o.slug,
      status: o.status,
      description: '',
      colorCode: ORG_COLOR_PALETTE[0],
      subscriptionStatus: 'active',
      subscriptionReadOnly: false,
      trialEndsAtSec: null,
    }));
  }, [canManageAll, orgsQuery.data, myOrgsQuery.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (subFilter !== 'all' && r.subscriptionStatus !== subFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
      );
    });
  }, [rows, search, subFilter]);

  const listLoading = canManageAll
    ? orgsQuery.isLoading || meQuery.isLoading
    : myOrgsQuery.isLoading || meQuery.isLoading;
  const listError = canManageAll ? orgsQuery.isError : myOrgsQuery.isError;

  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';

  const openCreate = useCallback(() => {
    void dialog.open({
      variant: 'custom',
      title: t('orgs.dialog.title'),
      icon: false,
      hideFooter: true,
      showCloseButton: true,
      maxWidth: 'sm',
      content: (
        <OrgCreateDialogForm
          onDone={async (createdId) => {
            dialog.close();
            if (createdId) {
              await queryClient.invalidateQueries({ queryKey: getGetApiV1OrgsQueryKey() });
              navigate(pathTo(organizationDetailPath(createdId), locale));
            }
          }}
        />
      ),
    });
  }, [dialog, t, queryClient, navigate, locale]);

  const toggleBlock = useCallback(
    async (org: OrgRow) => {
      const blocked = org.subscriptionStatus === 'blocked';
      const ok = blocked
        ? await dialog.confirm({
            title: t('orgs.confirmUnblock.title'),
            description: t('orgs.confirmUnblock.description', { name: org.name }),
          })
        : await dialog.danger({
            title: t('orgs.confirmBlock.title'),
            description: t('orgs.confirmBlock.description', { name: org.name }),
            confirmLabel: t('orgs.actions.block'),
          });
      if (!ok) return;
      setPatchingId(org.id);
      try {
        await patchApiV1OrgsOrgId(org.id, {
          subscriptionStatus: blocked ? 'active' : 'blocked',
        });
        await queryClient.invalidateQueries({ queryKey: getGetApiV1OrgsQueryKey() });
        notify.success(blocked ? t('orgs.dialog.unblocked') : t('orgs.dialog.blocked'));
      } catch {
        notify.error(t('orgs.loadError'));
      } finally {
        setPatchingId(null);
      }
    },
    [dialog, t, queryClient, notify],
  );

  const columns = useMemo<AzesTableProps<OrgRow>['columns']>(
    () => [
      {
        id: 'color',
        header: t('orgs.columns.color'),
        cell: ({ row }) => (
          <OrgColorDot colorCode={row.original.colorCode} label={t('orgs.fields.color')} />
        ),
      },
      { accessorKey: 'name', header: t('orgs.columns.name') },
      {
        id: 'description',
        header: t('orgs.columns.description'),
        cell: ({ row }) => row.original.description || '—',
      },
      {
        id: 'subscriptionStatus',
        header: t('orgs.columns.subscription'),
        cell: ({ row }) => (
          <Stack direction="row" gap={1} wrap>
            <Chip
              size="small"
              color={row.original.subscriptionStatus === 'blocked' ? 'error' : 'success'}
              label={
                row.original.subscriptionStatus === 'blocked'
                  ? t('orgs.subscription.blocked')
                  : t('orgs.subscription.active')
              }
            />
            {row.original.subscriptionReadOnly ? (
              <Chip size="small" color="warning" label={t('orgs.subscription.readOnly')} />
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'trialEndsAt',
        header: t('orgs.columns.trialEnds'),
        cell: ({ row }) => trialRelativeLabel(row.original.trialEndsAtSec, t),
      },
      {
        id: 'status',
        header: t('orgs.columns.status'),
        cell: ({ row }) =>
          row.original.status === 'disabled' ? t('orgs.status.disabled') : t('orgs.status.active'),
      },
      ...(canManageAll
        ? [
            {
              id: 'actions',
              header: t('orgs.columns.actions'),
              cell: ({ row }: { row: { original: OrgRow } }) => {
                const org = row.original;
                const blocked = org.subscriptionStatus === 'blocked';
                return (
                  <MuiBox onClick={(e) => e.stopPropagation()}>
                    <AzesMenu
                      aria-label={t('chrome.actions.more')}
                      placement="bottom-end"
                      items={[
                        {
                          id: 'users',
                          label: t('orgs.actions.users'),
                          onSelect: () => navigate(pathTo(PATHS.users, locale)),
                        },
                        { type: 'divider', id: 'div-block' },
                        {
                          id: 'block',
                          label: blocked ? t('orgs.actions.unblock') : t('orgs.actions.block'),
                          danger: !blocked,
                          disabled: patchingId === org.id,
                          onSelect: () => void toggleBlock(org),
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
                );
              },
            } as AzesTableProps<OrgRow>['columns'][number],
          ]
        : []),
    ],
    [t, canManageAll, patchingId, navigate, locale, toggleBlock],
  );

  const filterChips = useMemo(() => {
    const chips = [];
    if (subFilter !== 'all') {
      chips.push({
        id: 'sub',
        label:
          subFilter === 'blocked' ? t('orgs.subscription.blocked') : t('orgs.subscription.active'),
        onDelete: () => setSubFilter('all'),
      });
    }
    return chips;
  }, [subFilter, t]);

  return (
    <Stack gap={3}>
      <PageHeader
        title={t('orgs.title')}
        subtitle={canManageAll ? t('orgs.subtitle') : t('orgs.subtitleMember')}
        startAdornment={<IconBusiness color="primary" />}
        actions={
          canCreate ? (
            <MuiButton variant="contained" startIcon={<IconAdd />} onClick={openCreate}>
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
          canManageAll ? (
            <>
              <Chip
                size="small"
                clickable
                color={subFilter === 'all' ? 'primary' : 'default'}
                label={t('orgs.filters.all')}
                onClick={() => setSubFilter('all')}
              />
              <Chip
                size="small"
                clickable
                color={subFilter === 'active' ? 'primary' : 'default'}
                label={t('orgs.subscription.active')}
                onClick={() => setSubFilter('active')}
              />
              <Chip
                size="small"
                clickable
                color={subFilter === 'blocked' ? 'primary' : 'default'}
                label={t('orgs.subscription.blocked')}
                onClick={() => setSubFilter('blocked')}
              />
            </>
          ) : undefined
        }
        chips={filterChips}
        clearLabel={t('chrome.filters.clear')}
        onClear={() => {
          setSearch('');
          setSubFilter('all');
        }}
      />

      {listError ? (
        <Text tone="secondary">{t('orgs.loadError')}</Text>
      ) : !listLoading && filtered.length === 0 ? (
        <EmptyState
          icon={<IconBusiness fontSize="inherit" />}
          title={t('chrome.empty.title')}
          description={t('orgs.empty.description')}
          action={
            canCreate ? (
              <MuiButton variant="contained" startIcon={<IconAdd />} onClick={openCreate}>
                {t('chrome.actions.create')}
              </MuiButton>
            ) : undefined
          }
        />
      ) : (
        <MuiBox sx={{ overflowX: 'auto' }}>
          <AzesTable
            aria-label={t('orgs.title')}
            columns={columns}
            data={filtered}
            getRowId={(row) => row.id}
            loading={listLoading}
            onRowClick={(row) => {
              navigate(pathTo(organizationDetailPath(row.id), locale));
            }}
          />
        </MuiBox>
      )}
    </Stack>
  );
}
