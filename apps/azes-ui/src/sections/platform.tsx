/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/platform.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Settings engine, navigation engine (with permissions) and form binding demos
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createPermissionChecker } from '@azes/permissions';
import {
  Chip,
  FormControlLabel,
  MuiBox,
  Paper,
  Switch,
  Typography,
  useColorScheme,
} from '@azes/ui-web';
import {
  AzesForm,
  AzesFormActions,
  AzesFormSection,
  AzesFormTextField,
  useForm,
} from '@azes/ui-web/forms';
import { IconHome, IconLock, IconSettings, IconTable } from '@azes/ui-web/icons';
import {
  AzesNavHorizontalBar,
  AzesNavList,
  AzesNavMiniList,
  AzesNavProvider,
  navToneVars,
  type AzesAccessContext,
  type AzesNavConfig,
} from '@azes/ui-web/navigation';
import { AZES_SETTINGS_KEYS, useAzesSettings } from '@azes/ui-web/settings';
import { emailString, nonEmptyString, z } from '@azes/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { createElement, useMemo, useState } from 'react';

import { toHashHref } from '../routing/useHashRoute.js';
import { SectionIntro } from './shared.js';

function SettingRow({ settingKey }: { settingKey: (typeof AZES_SETTINGS_KEYS)[number] }) {
  const value = useAzesSettings((s) => s[settingKey]);
  return (
    <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
      <Typography variant="body2" component="dt">
        {settingKey}
      </Typography>
      <Typography variant="body2" component="dd" sx={{ m: 0, fontFamily: 'fontFamilyMono' }}>
        {value}
      </Typography>
    </MuiBox>
  );
}

export function SettingsEngineSection() {
  const { mode } = useColorScheme();
  return (
    <SectionIntro title="Settings live in an external store (localStorage key azes.settings.v1). Each row below subscribes to one key only. Open the settings drawer from the header to change them.">
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 480 }}>
        <MuiBox component="dl" sx={{ m: 0 }}>
          <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}>
            <Typography variant="body2" component="dt">
              mode (MUI useColorScheme)
            </Typography>
            <Typography variant="body2" component="dd" sx={{ m: 0, fontFamily: 'fontFamilyMono' }}>
              {mode ?? 'system'}
            </Typography>
          </MuiBox>
          {AZES_SETTINGS_KEYS.map((key) => (
            <SettingRow key={key} settingKey={key} />
          ))}
        </MuiBox>
      </Paper>
    </SectionIntro>
  );
}

const DEMO_NAV: AzesNavConfig = [
  {
    id: 'demo-main',
    subheader: 'Workspace',
    items: [
      {
        id: 'demo-home',
        title: 'Home',
        path: '/platform-navigation',
        icon: createElement(IconHome),
      },
      {
        id: 'demo-reports',
        title: 'Reports',
        path: '/demo/reports',
        icon: createElement(IconTable),
        badge: { content: 'New', color: 'info' },
        access: { permissions: ['reports.read'] },
      },
      {
        id: 'demo-admin',
        title: 'Administration',
        icon: createElement(IconSettings),
        access: { roles: ['admin'] },
        children: [
          { id: 'demo-users', title: 'Users', path: '/demo/users' },
          {
            id: 'demo-billing',
            title: 'Billing',
            path: '/demo/billing',
            access: { permissions: ['billing.manage'] },
          },
        ],
      },
      {
        id: 'demo-locked',
        title: 'Locked item',
        icon: createElement(IconLock),
        disabled: true,
        path: '/demo/locked',
      },
    ],
  },
];

export function NavigationEngineSection() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [canReports, setCanReports] = useState(true);
  const access = useMemo<AzesAccessContext>(() => {
    const checker = createPermissionChecker([
      ...(canReports ? ['reports.read'] : []),
      ...(isAdmin ? ['billing.manage'] : []),
    ]);
    return {
      can: checker.can,
      hasRole: (role) => isAdmin && role === 'admin',
      isEnabled: () => true,
    };
  }, [isAdmin, canReports]);

  return (
    <SectionIntro title="Navigation is data. The app injects a router adapter and an access context (here @azes/permissions); ui-web filters and renders. Filtering is UX only — the backend stays authoritative.">
      <MuiBox sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch checked={canReports} onChange={(e) => setCanReports(e.target.checked)} />
          }
          label="Grant reports.read"
        />
        <FormControlLabel
          control={<Switch checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />}
          label="Admin role"
        />
      </MuiBox>
      <AzesNavProvider
        router={{ pathname: '/platform-navigation', toHref: toHashHref }}
        access={access}
      >
        <MuiBox
          sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '280px 88px 1fr' } }}
        >
          <Paper
            component="nav"
            aria-label="Demo vertical nav"
            variant="outlined"
            sx={(theme) => ({ ...navToneVars(theme, 'integrated'), bgcolor: 'var(--azes-nav-bg)' })}
          >
            <AzesNavList config={DEMO_NAV} />
          </Paper>
          <Paper
            component="nav"
            aria-label="Demo mini nav"
            variant="outlined"
            sx={(theme) => ({ ...navToneVars(theme, 'contrast'), bgcolor: 'var(--azes-nav-bg)' })}
          >
            <AzesNavMiniList config={DEMO_NAV} />
          </Paper>
          <Paper
            component="nav"
            aria-label="Demo horizontal nav"
            variant="outlined"
            sx={(theme) => ({
              ...navToneVars(theme, 'integrated'),
              p: 2,
              alignSelf: 'start',
              minWidth: 0,
            })}
          >
            <AzesNavHorizontalBar config={DEMO_NAV} />
          </Paper>
        </MuiBox>
      </AzesNavProvider>
      <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label="filterNav" />
        <Chip label="resolveActiveTrail" />
        <Chip label="aria-current=page" />
        <Chip label="max depth 3" />
      </MuiBox>
    </SectionIntro>
  );
}

const profileSchema = z.object({
  name: nonEmptyString,
  email: emailString,
  company: z.string().trim().max(80),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function FormBindingSection() {
  const [saved, setSaved] = useState<ProfileValues | null>(null);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: { name: '', email: '', company: '' },
  });

  return (
    <SectionIntro title="react-hook-form + zod (@azes/validation). The app owns the schema and resolver; ui-web binds MUI fields, focuses the first invalid field and announces an error summary.">
      <Paper variant="outlined" sx={{ p: 6, maxWidth: 560 }}>
        <AzesForm form={form} onSubmit={(values) => setSaved(values)} aria-label="Profile">
          <AzesFormSection title="Profile" description="Shown to your team">
            <AzesFormTextField<ProfileValues> name="name" label="Full name" required />
            <AzesFormTextField<ProfileValues> name="email" label="Email" type="email" required />
            <AzesFormTextField<ProfileValues>
              name="company"
              label="Company"
              helperText="Optional"
            />
          </AzesFormSection>
          <AzesFormActions submitLabel="Save profile" resetLabel="Reset" />
        </AzesForm>
      </Paper>
      {saved ? (
        <Typography role="status" variant="body2" color="text.secondary">
          Saved {saved.name} ({saved.email})
        </Typography>
      ) : null}
    </SectionIntro>
  );
}
