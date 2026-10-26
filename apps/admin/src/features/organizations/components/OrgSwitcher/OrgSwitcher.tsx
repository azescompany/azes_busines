/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrgSwitcher/OrgSwitcher.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Active organization switcher (header) — server-side switch
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  getGetApiV1MeOrganizationsQueryKey,
  postApiV1MeActiveOrganization,
  useGetApiV1MeOrganizations,
} from '@azes/api/azes/orgs';
import { sessionFromTokens, useAuthClient } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { TextField } from '@azes/ui-web';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

export function OrgSwitcher() {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const orgsQuery = useGetApiV1MeOrganizations();
  const [busy, setBusy] = useState(false);

  const items = orgsQuery.data?.items ?? [];
  if (orgsQuery.isLoading || items.length === 0) {
    return null;
  }

  const active = items.find((i) => i.isActive)?.orgId ?? '';

  return (
    <TextField
      select
      size="small"
      label={t('orgs.switcher.label')}
      value={active}
      disabled={busy || items.length < 2}
      onChange={(event) => {
        const orgId = event.target.value;
        if (!orgId || orgId === active) return;
        setBusy(true);
        void (async () => {
          try {
            const result = await postApiV1MeActiveOrganization({ orgId });
            await authClient.establishSession(
              sessionFromTokens(result.accessToken, result.refreshToken),
            );
            await queryClient.invalidateQueries();
            await queryClient.invalidateQueries({
              queryKey: getGetApiV1MeOrganizationsQueryKey(),
            });
          } finally {
            setBusy(false);
          }
        })();
      }}
      slotProps={{
        select: { native: true },
        inputLabel: { shrink: true },
      }}
      sx={{ minWidth: { xs: 120, sm: 180 }, maxWidth: 240 }}
    >
      {items.map((org) => (
        <option key={org.orgId} value={org.orgId}>
          {org.name}
        </option>
      ))}
    </TextField>
  );
}
