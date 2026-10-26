/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/roleMenus/components/RoleMenusView/RoleMenusView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: SuperAdmin role ↔ menu binding UI (TAGET M1.5)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getGetApiV1MeQueryKey } from '@azes/api/azes/auth';
import {
  getGetApiV1RolesRoleMenusQueryKey,
  useGetApiV1Menus,
  useGetApiV1Roles,
  useGetApiV1RolesRoleMenus,
  usePutApiV1RolesRoleMenus,
} from '@azes/api/azes/menus';
import { useTranslation } from '@azes/i18n';
import { Checkbox, FormControlLabel, MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { checkPermission } from '../../../../auth/checkPermission.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

export function RoleMenusView() {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const queryClient = useQueryClient();
  const meQuery = useSessionMe();
  const canManage = checkPermission(meQuery.data?.permissions, 'org.manage_all');

  const rolesQuery = useGetApiV1Roles({ query: { enabled: canManage } });
  const menusQuery = useGetApiV1Menus(undefined, { query: { enabled: canManage } });

  const assignableRoles = useMemo(
    () => (rolesQuery.data?.items ?? []).filter((r) => r.assignable),
    [rolesQuery.data?.items],
  );

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [draftMenuIds, setDraftMenuIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (!selectedRole && assignableRoles[0]) {
      setSelectedRole(assignableRoles[0].name);
    }
  }, [assignableRoles, selectedRole]);

  const roleMenusQuery = useGetApiV1RolesRoleMenus(selectedRole, {
    query: { enabled: canManage && Boolean(selectedRole) },
  });

  useEffect(() => {
    if (roleMenusQuery.data?.menuIds) {
      setDraftMenuIds([...roleMenusQuery.data.menuIds]);
      setSaveOk(false);
      setSaveError(null);
    }
  }, [roleMenusQuery.data?.menuIds, selectedRole]);

  const putMutation = usePutApiV1RolesRoleMenus({
    mutation: {
      onSuccess: async (data) => {
        setDraftMenuIds([...data.menuIds]);
        setSaveOk(true);
        setSaveError(null);
        await queryClient.invalidateQueries({
          queryKey: getGetApiV1RolesRoleMenusQueryKey(selectedRole),
        });
        await queryClient.invalidateQueries({ queryKey: getGetApiV1MeQueryKey() });
      },
      onError: () => {
        setSaveOk(false);
        setSaveError(t('roleMenus.saveError'));
      },
    },
  });

  const toggleMenu = (menuId: string) => {
    setSaveOk(false);
    setDraftMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId],
    );
  };

  if (meQuery.isLoading) {
    return <AzesSkeleton shape="rect" height={240} width="100%" />;
  }

  if (!canManage) {
    return (
      <Stack gap={2}>
        <Text size="2xl" weight="bold">
          {t('roleMenus.title')}
        </Text>
        <Text tone="muted">{t('roleMenus.forbidden')}</Text>
      </Stack>
    );
  }

  const loading = rolesQuery.isLoading || menusQuery.isLoading || roleMenusQuery.isLoading;

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {t('roleMenus.title')}
      </Text>
      <Text tone="muted" size="sm">
        {t('roleMenus.subtitle')}
      </Text>

      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {assignableRoles.map((role) => (
          <MuiButton
            key={role.name}
            variant={selectedRole === role.name ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setSelectedRole(role.name)}
          >
            {t(`roleMenus.roles.${role.name}`)}
          </MuiButton>
        ))}
      </MuiBox>

      {loading ? (
        <AzesSkeleton shape="rect" height={200} width="100%" />
      ) : (
        <Stack gap={1}>
          <Text weight="bold">{t('roleMenus.menusFor', { role: selectedRole })}</Text>
          {(menusQuery.data?.items ?? []).map((menu) => (
            <FormControlLabel
              key={menu.id}
              control={
                <Checkbox
                  checked={draftMenuIds.includes(menu.id)}
                  onChange={() => toggleMenu(menu.id)}
                />
              }
              label={`${t(menu.i18nKey)} (${menu.path})`}
            />
          ))}
        </Stack>
      )}

      <MuiBox sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <MuiButton
          variant="contained"
          disabled={!selectedRole || putMutation.isPending}
          onClick={() => {
            setSaveError(null);
            putMutation.mutate({ role: selectedRole, data: { menuIds: draftMenuIds } });
          }}
        >
          {putMutation.isPending ? t('roleMenus.saving') : t('roleMenus.save')}
        </MuiButton>
        {saveOk ? (
          <Text tone="muted" size="sm">
            {t('roleMenus.saved')}
          </Text>
        ) : null}
        {saveError ? (
          <Text tone="secondary" size="sm">
            {saveError}
          </Text>
        ) : null}
      </MuiBox>
      <Text tone="muted" size="xs">
        {t('roleMenus.hint')}
      </Text>
    </Stack>
  );
}
