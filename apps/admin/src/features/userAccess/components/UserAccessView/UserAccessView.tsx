/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/userAccess/components/UserAccessView/UserAccessView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: User access editor — CRUD → permission codes (Phase 07 / AC-D03)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { azesMutator } from '@azes/api';
import { useGetApiV1Menus } from '@azes/api/azes/menus';
import { useGetApiV1MeOrganizations } from '@azes/api/azes/orgs';
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
import { IconLock, IconSecurity } from '@azes/ui-web/icons';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { pathTo, PATHS } from '../../../../app/router/paths.js';
import { checkPermission } from '../../../../auth/checkPermission.js';
import { invalidateAccessQueries } from '../../../../auth/invalidateAccessQueries.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import {
  EmptyState,
  PageHeader,
  useDirtyLeaveGuard,
  useNotify,
} from '../../../../shared/adminChrome/index.js';
import {
  formatCrudFlagLabel,
  permissionCodeForCrudFlag,
  type CrudFlag,
} from '../../models/crudPermissionLabels.js';

type AccessPermission = {
  menuId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type AccessResponse = {
  userId: string;
  orgId: string;
  menuIds: string[];
  permissions: AccessPermission[];
};

function snapshotKey(menuIds: string[], perms: Record<string, AccessPermission>): string {
  const ids = [...menuIds].sort();
  return JSON.stringify({
    ids,
    perms: ids.map((id) => perms[id] ?? null),
  });
}

export function UserAccessView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const me = useSessionMe();
  const canManage = checkPermission(me.data?.permissions, 'org.manage');
  const queryClient = useQueryClient();
  const notify = useNotify();
  const locale = (i18n.language?.slice(0, 2) || 'az') as 'az' | 'en' | 'ru';

  const myOrgs = useGetApiV1MeOrganizations({ query: { enabled: me.isSuccess } });
  const orgOptions = useMemo(
    () => (myOrgs.data?.items ?? []).map((o) => ({ id: o.orgId, name: o.name })),
    [myOrgs.data],
  );
  const [orgId, setOrgId] = useState('');
  useEffect(() => {
    if (!orgId && orgOptions[0]) setOrgId(orgOptions[0].id);
    if (!orgId && me.data?.orgId) setOrgId(me.data.orgId);
  }, [orgOptions, orgId, me.data?.orgId]);

  const menusQuery = useGetApiV1Menus(undefined, { query: { enabled: canManage } });

  const accessQuery = useQuery({
    queryKey: ['/api/v1/users', userId, 'access', orgId],
    enabled: canManage && Boolean(userId) && Boolean(orgId),
    queryFn: () =>
      azesMutator<AccessResponse>({
        url: `/api/v1/users/${encodeURIComponent(userId)}/access`,
        method: 'GET',
        params: { orgId },
      }),
  });

  const [menuIds, setMenuIds] = useState<string[]>([]);
  const [perms, setPerms] = useState<Record<string, AccessPermission>>({});
  const [baseline, setBaseline] = useState('');

  useEffect(() => {
    if (!accessQuery.data) return;
    const ids = [...accessQuery.data.menuIds];
    const map: Record<string, AccessPermission> = {};
    for (const p of accessQuery.data.permissions) {
      map[p.menuId] = { ...p };
    }
    for (const id of accessQuery.data.menuIds) {
      if (!map[id]) {
        map[id] = {
          menuId: id,
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        };
      }
    }
    setMenuIds(ids);
    setPerms(map);
    setBaseline(snapshotKey(ids, map));
  }, [accessQuery.data]);

  const dirty = baseline !== '' && snapshotKey(menuIds, perms) !== baseline;
  const { confirmLeave } = useDirtyLeaveGuard(dirty, {
    title: t('userAccess.leaveDirty.title'),
    description: t('userAccess.leaveDirty.description'),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      azesMutator({
        url: `/api/v1/users/${encodeURIComponent(userId)}/access`,
        method: 'PUT',
        params: { orgId },
        headers: { 'Content-Type': 'application/json' },
        data: {
          menuIds,
          permissions: menuIds.map(
            (id) =>
              perms[id] ?? {
                menuId: id,
                canRead: true,
                canCreate: false,
                canUpdate: false,
                canDelete: false,
              },
          ),
        },
      }),
    onSuccess: async () => {
      notify.success(t('userAccess.saved'));
      setBaseline(snapshotKey(menuIds, perms));
      await queryClient.invalidateQueries({
        queryKey: ['/api/v1/users', userId, 'access', orgId],
      });
      await invalidateAccessQueries(queryClient);
    },
    onError: () => {
      notify.error(t('userAccess.saveError'));
    },
  });

  const menus = menusQuery.data?.items ?? [];
  const selectedMenus = menus.filter((m) => menuIds.includes(m.id));

  const selectAll = () => {
    const allIds = menus.map((m) => m.id);
    setMenuIds(allIds);
    setPerms((prev) => {
      const next = { ...prev };
      for (const id of allIds) {
        if (!next[id]) {
          next[id] = {
            menuId: id,
            canRead: true,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
          };
        }
      }
      return next;
    });
  };

  const clearAll = () => {
    setMenuIds([]);
  };

  if (me.isLoading) {
    return <AzesSkeleton shape="rect" height={240} width="100%" />;
  }

  if (!canManage) {
    return (
      <Stack gap={3}>
        <PageHeader
          title={t('userAccess.title')}
          startAdornment={<IconSecurity color="primary" />}
        />
        <EmptyState
          icon={<IconLock fontSize="inherit" />}
          title={t('userAccess.forbidden')}
          description={t('chrome.empty.forbiddenHint')}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={3} style={{ paddingBottom: 88 }}>
      <PageHeader
        title={t('userAccess.title')}
        subtitle={t('userAccess.subtitle', { userId })}
        startAdornment={<IconSecurity color="primary" />}
        actions={
          <MuiButton
            variant="text"
            onClick={async () => {
              if (!(await confirmLeave())) return;
              navigate(pathTo(PATHS.users, locale));
            }}
          >
            {t('chrome.actions.back')}
          </MuiButton>
        }
      />

      <TextField
        select
        slotProps={{ select: { native: true } }}
        label={t('userAccess.fields.org')}
        value={orgId}
        onChange={async (e) => {
          if (!(await confirmLeave())) return;
          setOrgId(e.target.value);
        }}
        sx={{ maxWidth: 320 }}
      >
        {orgOptions.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </TextField>

      {accessQuery.isLoading || menusQuery.isLoading ? (
        <AzesSkeleton shape="rect" height={200} width="100%" />
      ) : (
        <MuiBox
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 1fr) 1.4fr' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <MuiBox
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack gap={2}>
              <Stack direction="row" gap={1} justify="space-between" align="center" wrap>
                <Text weight="semibold">{t('userAccess.menusTitle')}</Text>
                <Stack direction="row" gap={1}>
                  <MuiButton size="small" variant="text" onClick={selectAll}>
                    {t('userAccess.selectAll')}
                  </MuiButton>
                  <MuiButton size="small" variant="text" onClick={clearAll}>
                    {t('userAccess.clearAll')}
                  </MuiButton>
                </Stack>
              </Stack>
              {menus.map((menu) => {
                const checked = menuIds.includes(menu.id);
                const key = menu.i18nKey || '';
                const translated = key ? t(key) : '';
                const title = translated && translated !== key ? translated : menu.code || menu.id;
                return (
                  <FormControlLabel
                    key={menu.id}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(_, next) => {
                          setMenuIds((prev) =>
                            next ? [...prev, menu.id] : prev.filter((id) => id !== menu.id),
                          );
                          if (next && !perms[menu.id]) {
                            setPerms((prev) => ({
                              ...prev,
                              [menu.id]: {
                                menuId: menu.id,
                                canRead: true,
                                canCreate: false,
                                canUpdate: false,
                                canDelete: false,
                              },
                            }));
                          }
                        }}
                      />
                    }
                    label={`${title} (${menu.path})`}
                  />
                );
              })}
            </Stack>
          </MuiBox>

          <MuiBox
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              minHeight: 160,
            }}
          >
            <Stack gap={2}>
              <Text weight="semibold">{t('userAccess.flagsTitle')}</Text>
              <Text size="sm" tone="muted">
                {t('userAccess.flagsHint')}
              </Text>
              {selectedMenus.length === 0 ? (
                <Text tone="muted" size="sm">
                  {t('userAccess.noMenusSelected')}
                </Text>
              ) : (
                selectedMenus.map((menu) => {
                  const p = perms[menu.id];
                  const key = menu.i18nKey || '';
                  const translated = key ? t(key) : '';
                  const title =
                    translated && translated !== key ? translated : menu.code || menu.id;
                  const codes = menu.permissionCodes;
                  const flagRows: { flag: CrudFlag; base: string }[] = [
                    { flag: 'canRead', base: t('userAccess.flags.read') },
                    { flag: 'canCreate', base: t('userAccess.flags.create') },
                    { flag: 'canUpdate', base: t('userAccess.flags.update') },
                    { flag: 'canDelete', base: t('userAccess.flags.delete') },
                  ];
                  return (
                    <MuiBox
                      key={menu.id}
                      sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}
                    >
                      <Text size="sm" weight="semibold">
                        {title}
                      </Text>
                      <Stack direction="row" gap={1} wrap>
                        {flagRows.map(({ flag, base }) => {
                          const code = permissionCodeForCrudFlag(codes, flag);
                          // Without a matching {resource}.{action} code, mutating flags are UX-disabled.
                          const disabled =
                            flag !== 'canRead' && Array.isArray(codes) && codes.length > 0 && !code;
                          return (
                            <FormControlLabel
                              key={flag}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={Boolean(p?.[flag])}
                                  disabled={disabled}
                                  onChange={(_, next) =>
                                    setPerms((prev) => ({
                                      ...prev,
                                      [menu.id]: {
                                        menuId: menu.id,
                                        canRead: prev[menu.id]?.canRead ?? true,
                                        canCreate: prev[menu.id]?.canCreate ?? false,
                                        canUpdate: prev[menu.id]?.canUpdate ?? false,
                                        canDelete: prev[menu.id]?.canDelete ?? false,
                                        [flag]: next,
                                      },
                                    }))
                                  }
                                />
                              }
                              label={formatCrudFlagLabel(base, code)}
                            />
                          );
                        })}
                      </Stack>
                    </MuiBox>
                  );
                })
              )}
            </Stack>
          </MuiBox>
        </MuiBox>
      )}

      <MuiBox
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: 1,
          mx: { xs: -1, sm: 0 },
          px: 2,
          py: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 3,
        }}
      >
        <Text size="sm" tone="muted">
          {dirty ? t('userAccess.sticky.dirty') : t('userAccess.sticky.clean')}
        </Text>
        <Stack direction="row" gap={1}>
          <MuiButton
            variant="text"
            disabled={!dirty || saveMutation.isPending}
            onClick={() => {
              if (!accessQuery.data) return;
              const ids = [...accessQuery.data.menuIds];
              const map: Record<string, AccessPermission> = {};
              for (const p of accessQuery.data.permissions) {
                map[p.menuId] = { ...p };
              }
              setMenuIds(ids);
              setPerms(map);
              setBaseline(snapshotKey(ids, map));
            }}
          >
            {t('chrome.actions.discard')}
          </MuiButton>
          <MuiButton
            variant="contained"
            disabled={!orgId || !dirty || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? t('userAccess.saving') : t('userAccess.sticky.save')}
          </MuiButton>
        </Stack>
      </MuiBox>
    </Stack>
  );
}
