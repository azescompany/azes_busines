/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/mui-x.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-09
 * ║ Purpose: Lazy-loaded DataGrid, AzesTable, and charts showcase
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Paper } from '@azes/ui-web';
import { AzesBarChart, AzesLineChart, AzesPieChart } from '@azes/ui-web/charts';
import { AzesDataGrid, type GridColDef } from '@azes/ui-web/data-grid';
import {
  AzesTable,
  createActionsColumn,
  type AzesTableLabels,
  type ColumnDef,
} from '@azes/ui-web/table';

import { SectionIntro } from './shared.js';

const SHOWCASE_TABLE_LABELS: AzesTableLabels = {
  rowsPerPage: 'Rows per page',
  displayedRows: (from, to, count) => `${from}–${to} of ${count}`,
  previousPage: 'Previous page',
  nextPage: 'Next page',
  empty: 'No rows',
  selectAll: 'Select all',
  selectRow: 'Select row',
};

export type DemoUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  seats: number;
};

const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer'];
const STATUSES = ['Active', 'Invited', 'Suspended'];
const NAMES = [
  'Aysel',
  'Murad',
  'Leyla',
  'Kamran',
  'Nigar',
  'Elvin',
  'Sevda',
  'Rauf',
  'Gunel',
  'Tural',
];

export const DEMO_USERS: readonly DemoUser[] = Array.from({ length: 42 }, (_, index) => {
  const name = `${NAMES[index % NAMES.length]} ${String.fromCharCode(65 + (index % 26))}.`;
  return {
    id: index + 1,
    name,
    email: `user${index + 1}@example.com`,
    role: ROLES[index % ROLES.length] ?? 'Viewer',
    status: STATUSES[index % STATUSES.length] ?? 'Active',
    seats: (index * 7) % 23,
  };
});

export const USER_COLUMNS: GridColDef<DemoUser>[] = [
  { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
  { field: 'role', headerName: 'Role', width: 120 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'seats', headerName: 'Seats', type: 'number', width: 100 },
];

export function DataGridSection() {
  return (
    <SectionIntro title="AzesDataGrid (legacy): autoHeight, sticky actions, density from settings, checkbox selection.">
      <MuiBox sx={{ minWidth: 0, width: '100%' }}>
        <AzesDataGrid<DemoUser>
          aria-label="Team members"
          rows={DEMO_USERS as DemoUser[]}
          columns={USER_COLUMNS}
          checkboxSelection
          maxHeight="60vh"
        />
      </MuiBox>
    </SectionIntro>
  );
}

const TABLE_COLUMNS: ColumnDef<DemoUser>[] = [
  { accessorKey: 'name', header: 'Name', meta: { minWidth: 160 } },
  { accessorKey: 'email', header: 'Email', meta: { minWidth: 200 } },
  { accessorKey: 'role', header: 'Role', meta: { width: 120 } },
  { accessorKey: 'status', header: 'Status', meta: { width: 120 } },
  { accessorKey: 'seats', header: 'Seats', meta: { width: 100, align: 'right' } },
  createActionsColumn<DemoUser>({
    header: 'Actions',
    width: 96,
    cell: ({ row }) => (
      <button type="button" aria-label={`Edit ${row.original.name}`}>
        Edit
      </button>
    ),
  }),
];

export function AzesTableSection() {
  return (
    <SectionIntro title="AzesTable: TanStack + MUI Table, sticky actions, natural height, server/client pagination API, checkbox selection.">
      <MuiBox sx={{ minWidth: 0, width: '100%' }}>
        <AzesTable
          aria-label="Team members table"
          data={[...DEMO_USERS]}
          columns={TABLE_COLUMNS}
          getRowId={(row) => String(row.id)}
          checkboxSelection
          labels={SHOWCASE_TABLE_LABELS}
        />
      </MuiBox>
    </SectionIntro>
  );
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export function ChartsSection() {
  return (
    <SectionIntro title="Chart colors come from azesChartPalette(theme) (primary, secondary, status). Every chart has a title for screen readers.">
      <MuiBox sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <AzesLineChart
            title="Active users per month"
            xAxis={[{ scaleType: 'point', data: MONTHS }]}
            series={[
              { data: [120, 180, 160, 240, 280, 260, 320, 360, 410], label: 'This year' },
              { data: [90, 110, 140, 150, 190, 210, 220, 260, 300], label: 'Last year' },
            ]}
          />
        </Paper>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <AzesBarChart
            title="Revenue by quarter"
            xAxis={[{ scaleType: 'band', data: ['Q1', 'Q2', 'Q3', 'Q4'] }]}
            series={[
              { data: [42, 55, 61, 70], label: 'Product' },
              { data: [18, 22, 30, 34], label: 'Services' },
            ]}
          />
        </Paper>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <AzesPieChart
            title="Plan distribution"
            series={[
              {
                innerRadius: 60,
                data: [
                  { id: 0, value: 48, label: 'Starter' },
                  { id: 1, value: 32, label: 'Business' },
                  { id: 2, value: 20, label: 'Enterprise' },
                ],
              },
            ]}
          />
        </Paper>
      </MuiBox>
    </SectionIntro>
  );
}
