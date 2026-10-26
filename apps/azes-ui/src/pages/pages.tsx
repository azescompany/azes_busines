/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/pages/pages.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Pilot pages (analytics, list, form) composed only from @azes/ui-web
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  Alert,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  LinearProgress,
  MuiBox,
  MuiButton,
  Paper,
  TextField,
  Typography,
} from '@azes/ui-web';
import { AzesBarChart, AzesLineChart } from '@azes/ui-web/charts';
import { AzesDataGrid } from '@azes/ui-web/data-grid';
import {
  AzesForm,
  AzesFormActions,
  AzesFormSection,
  AzesFormTextField,
  useForm,
} from '@azes/ui-web/forms';
import { IconAdd, IconDownload, IconSearch } from '@azes/ui-web/icons';
import { nonEmptyString, z } from '@azes/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, type ReactNode } from 'react';

import { DEMO_USERS, MONTHS, USER_COLUMNS, type DemoUser } from '../sections/mui-x.js';
import type { SectionProps } from '../sections/SectionContent.js';

const KPIS = [
  { label: 'Active users', value: '18,420', delta: '+12.4%', tone: 'success' as const },
  { label: 'Revenue', value: '$214k', delta: '+4.1%', tone: 'success' as const },
  { label: 'Churn', value: '2.3%', delta: '-0.4%', tone: 'success' as const },
  { label: 'Open tickets', value: '37', delta: '+6', tone: 'warning' as const },
];

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-end', mb: 6 }}>
      <MuiBox sx={{ flex: 1, minWidth: 240 }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </MuiBox>
      {actions}
    </MuiBox>
  );
}

export function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Dashboard layout, KPI cards and lazy charts."
        actions={
          <MuiButton variant="outlined" startIcon={<IconDownload />}>
            Export
          </MuiButton>
        }
      />
      <MuiBox
        component="ul"
        aria-label="Key metrics"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mb: 6,
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' },
        }}
      >
        {KPIS.map((kpi) => (
          <Card key={kpi.label} component="li" variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {kpi.label}
              </Typography>
              <Typography variant="h4" component="p" sx={{ my: 1 }}>
                {kpi.value}
              </Typography>
              <Chip size="small" color={kpi.tone} label={kpi.delta} />
            </CardContent>
          </Card>
        ))}
      </MuiBox>
      <MuiBox sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
        <Paper variant="outlined" sx={{ p: 4, minWidth: 0 }}>
          <AzesLineChart
            title="Sessions per month"
            xAxis={[{ scaleType: 'point', data: MONTHS }]}
            series={[
              { data: [3, 4, 3.5, 5, 6, 5.8, 7, 7.4, 8.1], label: 'Sessions (k)', area: true },
            ]}
          />
        </Paper>
        <Paper variant="outlined" sx={{ p: 4, minWidth: 0 }}>
          <Typography variant="subtitle1" component="h3" gutterBottom>
            Plan capacity
          </Typography>
          {[
            ['Starter', 72],
            ['Business', 48],
            ['Enterprise', 91],
          ].map(([label, value]) => (
            <MuiBox key={label} sx={{ mb: 4 }}>
              <MuiBox sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {value}%
                </Typography>
              </MuiBox>
              <LinearProgress
                variant="determinate"
                value={Number(value)}
                aria-label={`${label} capacity`}
              />
            </MuiBox>
          ))}
          <AzesBarChart
            title="Signups by channel"
            height={200}
            xAxis={[{ scaleType: 'band', data: ['Organic', 'Ads', 'Referral'] }]}
            series={[{ data: [44, 28, 19], label: 'Signups' }]}
          />
        </Paper>
      </MuiBox>
    </>
  );
}

export function ListPage({ onSnack }: SectionProps) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? DEMO_USERS.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q))
      : DEMO_USERS;
  }, [query]);

  return (
    <>
      <PageHeader
        title="Team members"
        description="List page: search, data grid, empty state and primary action."
        actions={
          <MuiButton variant="contained" startIcon={<IconAdd />} onClick={onSnack}>
            Invite member
          </MuiButton>
        }
      />
      <TextField
        size="small"
        label="Search members"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ mb: 4, maxWidth: 360 }}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {rows.length === 0 ? (
        <Alert severity="info">No members match “{query}”.</Alert>
      ) : (
        <MuiBox sx={{ minWidth: 0 }}>
          <AzesDataGrid<DemoUser>
            aria-label="Team members"
            maxHeight="60vh"
            rows={rows as DemoUser[]}
            columns={USER_COLUMNS}
          />
        </MuiBox>
      )}
    </>
  );
}

const workspaceSchema = z.object({
  workspace: nonEmptyString,
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,32}$/, 'Use 3–32 lowercase letters, digits or dashes'),
  description: z.string().trim().max(200, 'Keep it under 200 characters'),
});

type WorkspaceValues = z.infer<typeof workspaceSchema>;

export function FormPage({ onSnack }: SectionProps) {
  const form = useForm<WorkspaceValues>({
    resolver: zodResolver(workspaceSchema),
    mode: 'onTouched',
    defaultValues: { workspace: '', slug: '', description: '' },
  });

  return (
    <>
      <PageHeader
        title="Create workspace"
        description="Form page: sections, validation, actions."
      />
      <Paper variant="outlined" sx={{ p: { xs: 4, md: 8 }, maxWidth: 720 }}>
        <AzesForm
          form={form}
          aria-label="Create workspace"
          onSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 400));
            onSnack();
            form.reset();
          }}
        >
          <AzesFormSection title="Workspace" description="Visible to everyone you invite.">
            <AzesFormTextField<WorkspaceValues> name="workspace" label="Workspace name" required />
            <AzesFormTextField<WorkspaceValues>
              name="slug"
              label="URL slug"
              required
              helperText="Lowercase letters, digits and dashes"
            />
          </AzesFormSection>
          <AzesFormSection title="Details">
            <AzesFormTextField<WorkspaceValues>
              name="description"
              label="Description"
              multiline
              minRows={3}
            />
          </AzesFormSection>
          <AzesFormActions submitLabel="Create workspace" resetLabel="Reset" />
        </AzesForm>
      </Paper>
    </>
  );
}
