/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Accordion/AzesAccordion.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: AzesAccordion search/crud a11y and interaction tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../../theme/AzesThemeProvider';
import { AzesAccordion } from './AzesAccordion';
import { AzesFormGrid } from './AzesFormGrid';

describe('AzesAccordion', () => {
  it('toggles region a11y attrs with click and keyboard', () => {
    render(
      <AzesThemeProvider>
        <AzesAccordion
          mode="search"
          title="Filters"
          defaultOpen={false}
          onSubmit={() => undefined}
          onReset={() => undefined}
          submitLabel="Search"
          resetLabel="Reset"
        >
          <input aria-label="Query" />
        </AzesAccordion>
      </AzesThemeProvider>,
    );

    const header = screen.getByRole('button', { name: /Filters/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    const panelId = header.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: /Filters/i })).toHaveAttribute('id', panelId!);

    fireEvent.keyDown(header, { key: ' ' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('search submit/reset and closed-state filter chips', () => {
    const onSubmit = vi.fn();
    const onReset = vi.fn();
    const onRemove = vi.fn();
    render(
      <AzesThemeProvider>
        <AzesAccordion
          mode="search"
          title="Filters"
          defaultOpen={false}
          onSubmit={onSubmit}
          onReset={onReset}
          submitLabel="Search"
          resetLabel="Reset"
          activeFilters={[{ key: 'name', label: 'Name: Ada', onRemove }]}
        >
          <input aria-label="Name" />
        </AzesAccordion>
      </AzesThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Name: Ada' }));
    // Chip delete is the delete icon button inside chip — use onDelete via close icon
    const chip = screen.getByText('Name: Ada').closest('.MuiChip-root');
    expect(chip).toBeTruthy();
    const deleteIcon = within(chip as HTMLElement).getByTestId('CancelIcon');
    fireEvent.click(deleteIcon);
    expect(onRemove).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Filters/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('crud dirty guard asks before cancel', () => {
    const onCancel = vi.fn();
    render(
      <AzesThemeProvider>
        <AzesAccordion
          mode="crud"
          intent="edit"
          title="Edit user"
          defaultOpen
          isDirty
          onSubmit={() => undefined}
          onCancel={onCancel}
          submitLabel="Save"
          cancelLabel="Cancel"
          discardTitle="Discard changes?"
          discardDescription="Leave?"
          discardConfirmLabel="Discard"
          discardCancelLabel="Keep"
        >
          <input aria-label="Username" defaultValue="Ada" />
        </AzesAccordion>
      </AzesThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Discard changes?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders form grid and brand seeds without crashing', () => {
    const { rerender } = render(
      <AzesThemeProvider primary="teal">
        <AzesAccordion
          mode="crud"
          intent="create"
          title="Add"
          defaultOpen
          onSubmit={() => undefined}
          onCancel={() => undefined}
        >
          <AzesFormGrid columns={3}>
            <input aria-label="A" />
            <input aria-label="B" />
            <input aria-label="C" />
          </AzesFormGrid>
        </AzesAccordion>
      </AzesThemeProvider>,
    );
    expect(screen.getByRole('region', { name: 'Add' })).toBeInTheDocument();
    rerender(
      <AzesThemeProvider primary="violet">
        <AzesAccordion
          mode="search"
          title="Search"
          defaultOpen
          onSubmit={() => undefined}
          onReset={() => undefined}
          submitLabel="Go"
          resetLabel="Clear"
        >
          <input aria-label="Q" />
        </AzesAccordion>
      </AzesThemeProvider>,
    );
    expect(screen.getByRole('region', { name: 'Search' })).toBeInTheDocument();
  });
});
