/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Button/Button.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Button interaction and accessibility tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../../theme/AzesThemeProvider';
import { Button } from './Button';

function renderButton(ui: ReactElement) {
  return render(<AzesThemeProvider>{ui}</AzesThemeProvider>);
}

describe('Button', () => {
  it('renders a native button with accessible name', () => {
    renderButton(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('invokes onClick when enabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderButton(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onClick when disabled or loading', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <AzesThemeProvider>
        <Button disabled onClick={onClick}>
          Save
        </Button>
      </AzesThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();

    rerender(
      <AzesThemeProvider>
        <Button loading onClick={onClick}>
          Save
        </Button>
      </AzesThemeProvider>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
