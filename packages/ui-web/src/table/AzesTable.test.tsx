/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/AzesTable.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-10
 * ║ Purpose: AzesTable sort, pagination, selection, sticky actions
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ColumnDef } from '@tanstack/react-table';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesTable, type AzesTableLabels } from './AzesTable';
import { AzesTableLabelsProvider } from './AzesTableLabelsContext';
import { createActionsColumn } from './createActionsColumn';
import { AZES_TABLE_STICKY_END_CLASS } from './tableStyles';

type Row = { id: number; name: string; role: string };

const LABELS: AzesTableLabels = {
  rowsPerPage: 'Rows per page',
  displayedRows: (from, to, count) => `${from}–${to} of ${count}`,
  previousPage: 'Previous page',
  nextPage: 'Next page',
  emptyTitle: 'No data found',
  empty: 'No rows',
  selectAll: 'Select all',
  selectRow: 'Select row',
};

const BASE_COLUMNS: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  createActionsColumn<Row>({
    header: 'Actions',
    cell: ({ row }) => (
      <button type="button" aria-label={`Delete ${row.original.name}`}>
        Del
      </button>
    ),
  }),
];

const ROWS: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: i % 2 === 0 ? 'Admin' : 'Editor',
}));

function renderTable(ui: ReactElement) {
  return render(<AzesThemeProvider>{ui}</AzesThemeProvider>);
}

describe('AzesTable', () => {
  it('renders headers, rows, aria-label and scope=col', () => {
    renderTable(
      <AzesTable
        aria-label="People"
        data={ROWS.slice(0, 3)}
        columns={BASE_COLUMNS}
        labels={LABELS}
      />,
    );
    expect(screen.getByRole('region', { name: 'People' })).toBeInTheDocument();
    const nameHeader = screen.getByRole('columnheader', { name: /Name/i });
    expect(nameHeader).toHaveAttribute('scope', 'col');
    expect(screen.getByText('User 1')).toBeInTheDocument();
  });

  it('cycles sort via header click and reports aria-sort', async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    renderTable(
      <AzesTable
        aria-label="Sortable"
        data={ROWS.slice(0, 3)}
        columns={BASE_COLUMNS}
        labels={LABELS}
        sortModel={[]}
        onSortModelChange={onSort}
        sortingMode="server"
      />,
    );
    const header = screen.getByRole('columnheader', { name: /Name/i });
    expect(header).toHaveAttribute('aria-sort', 'none');
    await user.click(within(header).getByRole('button'));
    expect(onSort).toHaveBeenCalled();
  });

  it('paginates client-side and resets pageIndex when page size changes', async () => {
    const user = userEvent.setup();
    renderTable(
      <AzesTable aria-label="Paged" data={ROWS} columns={BASE_COLUMNS} labels={LABELS} />,
    );
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.queryByText('User 11')).not.toBeInTheDocument();

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(screen.getByText('User 11')).toBeInTheDocument();
  });

  it('uses server rowCount for pagination footer', () => {
    renderTable(
      <AzesTable
        aria-label="Server"
        data={ROWS.slice(0, 10)}
        columns={BASE_COLUMNS}
        labels={LABELS}
        paginationMode="server"
        rowCount={124}
        paginationModel={{ page: 0, pageSize: 10 }}
      />,
    );
    expect(screen.getByText('1–10 of 124')).toBeInTheDocument();
  });

  it('marks actions sticky by default and respects stickyActions={false}', () => {
    const { rerender } = renderTable(
      <AzesTable
        aria-label="Sticky"
        data={ROWS.slice(0, 2)}
        columns={BASE_COLUMNS}
        labels={LABELS}
      />,
    );
    expect(document.querySelector(`.${AZES_TABLE_STICKY_END_CLASS}`)).toBeTruthy();

    rerender(
      <AzesThemeProvider>
        <AzesTable
          aria-label="Sticky"
          stickyActions={false}
          data={ROWS.slice(0, 2)}
          columns={BASE_COLUMNS}
          labels={LABELS}
        />
      </AzesThemeProvider>,
    );
    expect(document.querySelector(`.${AZES_TABLE_STICKY_END_CLASS}`)).toBeNull();
  });

  it('supports select-all indeterminate without selecting on row click', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderTable(
      <AzesTable
        aria-label="Select"
        data={ROWS.slice(0, 3)}
        columns={BASE_COLUMNS}
        labels={LABELS}
        checkboxSelection
        rowSelection={{}}
        onRowSelectionChange={onSelect}
        onRowClick={() => undefined}
      />,
    );
    const row = screen.getByText('User 1').closest('tr');
    expect(row).toBeTruthy();
    await user.click(row!);
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('Select all'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows Paper empty state instead of table when there are no rows', () => {
    renderTable(
      <AzesTable aria-label="Empty" data={[]} columns={BASE_COLUMNS} labels={LABELS} minRows={5} />,
    );
    const empty = document.querySelector('[data-azes-empty-state]');
    expect(empty).toBeTruthy();
    expect(within(empty as HTMLElement).getByText('No data found')).toBeInTheDocument();
    expect(within(empty as HTMLElement).getByText('No rows')).toBeInTheDocument();
    expect(document.querySelector('.azes-table-root')).toBeNull();
    expect(screen.queryByText('Rows per page')).toBeNull();
  });

  it('uses provider empty labels when per-table labels omit empty copy', () => {
    render(
      <AzesThemeProvider>
        <AzesTableLabelsProvider
          labels={{
            emptyTitle: 'Global not found',
            empty: 'Global empty description',
          }}
        >
          <AzesTable aria-label="Provider empty" data={[]} columns={BASE_COLUMNS} />
        </AzesTableLabelsProvider>
      </AzesThemeProvider>,
    );
    const empty = document.querySelector('[data-azes-empty-state]');
    expect(empty).toBeTruthy();
    expect(within(empty as HTMLElement).getByText('Global not found')).toBeInTheDocument();
    expect(within(empty as HTMLElement).getByText('Global empty description')).toBeInTheDocument();
  });

  it('sets aria-busy while loading and keeps minRows skeleton rows', () => {
    renderTable(
      <AzesTable
        aria-label="Loading"
        data={[]}
        columns={BASE_COLUMNS}
        labels={LABELS}
        loading
        minRows={5}
      />,
    );
    expect(screen.getByRole('region', { name: 'Loading' })).toHaveAttribute('aria-busy', 'true');
    expect(document.querySelectorAll('.azes-table-row').length).toBe(5);
  });

  it('renders across brand seeds without throwing', () => {
    for (const primary of ['teal', 'violet', 'red'] as const) {
      const { unmount } = render(
        <AzesThemeProvider primary={primary}>
          <AzesTable
            aria-label={`brand-${primary}`}
            data={ROWS.slice(0, 2)}
            columns={BASE_COLUMNS}
            labels={LABELS}
          />
        </AzesThemeProvider>,
      );
      expect(screen.getByRole('region', { name: `brand-${primary}` })).toBeInTheDocument();
      unmount();
    }
  });
});
