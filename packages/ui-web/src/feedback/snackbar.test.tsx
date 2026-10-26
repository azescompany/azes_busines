/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/feedback/snackbar.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Unit tests for global AzesSnackbar queue host
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesSnackbarProvider, useAzesSnackbar } from './AzesSnackbarProvider';

function Probe() {
  const snackbar = useAzesSnackbar();
  return (
    <div>
      <button type="button" onClick={() => snackbar.success('Saved')}>
        success
      </button>
      <button type="button" onClick={() => snackbar.error('Failed')}>
        error
      </button>
      <button type="button" onClick={() => snackbar.close()}>
        close
      </button>
    </div>
  );
}

function renderHost() {
  return render(
    <AzesThemeProvider>
      <AzesSnackbarProvider>
        <Probe />
      </AzesSnackbarProvider>
    </AzesThemeProvider>,
  );
}

describe('AzesSnackbarProvider', () => {
  it('shows a success snackbar from the global API', async () => {
    const user = userEvent.setup();
    renderHost();

    await user.click(screen.getByRole('button', { name: 'success' }));
    expect(await screen.findByText('Saved')).toBeTruthy();
  });

  it('queues a second message until the first closes', async () => {
    const user = userEvent.setup();
    renderHost();

    await user.click(screen.getByRole('button', { name: 'success' }));
    expect(await screen.findByText('Saved')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'error' }));
    expect(screen.queryByText('Failed')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'close' }));
    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeTruthy();
    });
  });

  it('throws outside the provider', () => {
    function Bare() {
      useAzesSnackbar();
      return null;
    }
    expect(() =>
      act(() => {
        render(<Bare />);
      }),
    ).toThrow(/AzesSnackbarProvider/);
  });
});
