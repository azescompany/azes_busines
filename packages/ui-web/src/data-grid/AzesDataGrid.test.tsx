/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/data-grid/AzesDataGrid.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-09
 * ║ Purpose: DataGrid density, autoHeight, sticky actions classes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AZES_STICKY_END_CLASS, AzesDataGrid } from './AzesDataGrid';

const baseColumns = [
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'actions', headerName: 'Actions', width: 88 },
];

describe('AzesDataGrid', () => {
  it('requires a name and follows theme density', () => {
    render(
      <AzesThemeProvider density="compact">
        <AzesDataGrid
          aria-label="Users"
          rows={[{ id: 1, name: 'Aysel' }]}
          columns={[{ field: 'name', headerName: 'Name' }]}
        />
      </AzesThemeProvider>,
    );
    const grid = screen.getByRole('grid', { name: 'Users' });
    expect(grid.closest('.MuiDataGrid-root')).toHaveClass('MuiDataGrid-root--densityCompact');
  });

  it('enables autoHeight by default', () => {
    render(
      <AzesThemeProvider>
        <AzesDataGrid
          aria-label="Grow"
          rows={[{ id: 1, name: 'Aysel' }]}
          columns={[{ field: 'name', headerName: 'Name' }]}
        />
      </AzesThemeProvider>,
    );
    expect(screen.getByRole('grid', { name: 'Grow' }).closest('.MuiDataGrid-root')).toHaveClass(
      'MuiDataGrid-autoHeight',
    );
  });

  it('marks actions columns sticky by default and respects stickyActions={false}', () => {
    const { rerender } = render(
      <AzesThemeProvider>
        <AzesDataGrid
          aria-label="Sticky"
          rows={[{ id: 1, name: 'Aysel', actions: null }]}
          columns={baseColumns}
        />
      </AzesThemeProvider>,
    );
    expect(document.querySelector(`.${AZES_STICKY_END_CLASS}`)).toBeTruthy();

    rerender(
      <AzesThemeProvider>
        <AzesDataGrid
          aria-label="Sticky"
          stickyActions={false}
          rows={[{ id: 1, name: 'Aysel', actions: null }]}
          columns={baseColumns}
        />
      </AzesThemeProvider>,
    );
    expect(document.querySelector(`.${AZES_STICKY_END_CLASS}`)).toBeNull();
  });
});
