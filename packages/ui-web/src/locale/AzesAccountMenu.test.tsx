/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/locale/AzesAccountMenu.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: AzesAccountMenu uses AzesMenu + logout action
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesAccountMenu } from './AzesAccountMenu';

describe('AzesAccountMenu', () => {
  it('opens AzesMenu and runs logout', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(
      <AzesThemeProvider>
        <AzesAccountMenu
          displayName="Ada Lovelace"
          label="Account"
          logoutLabel="Log out"
          onLogout={onLogout}
        />
      </AzesThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Account' }));
    const menu = await screen.findByRole('menu', { name: 'Account' });
    expect(menu).toBeTruthy();
    expect(screen.getByText('Ada Lovelace')).toBeTruthy();

    await user.click(screen.getByRole('menuitem', { name: /Log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
