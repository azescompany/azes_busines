/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/organizations/components/OrgSwitcher/OrgSwitcher.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-27
 * ║ Purpose: Active organization switcher — invalidate me + org caches (Phase 07)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { postApiV1MeActiveOrganization, useGetApiV1MeOrganizations } from '@azes/api/azes/orgs';
import { sessionFromTokens, useAuthClient } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { TextField } from '@azes/ui-web';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { invalidateAfterOrgSwitch } from '../../../../auth/invalidateAccessQueries.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import { useNotify } from '../../../../shared/adminChrome/index.js';

export function OrgSwitcher() {
  const { t } = useTranslation(ADMIN_NAMESPACE);
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const notify = useNotify();
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
            await invalidateAfterOrgSwitch(queryClient);
            notify.success(t('orgs.switcher.switched'));
          } catch {
            notify.error(t('orgs.switcher.error'));
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
