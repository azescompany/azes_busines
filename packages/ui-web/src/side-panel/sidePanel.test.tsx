/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/sidePanel.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Open/close/toggle, portal, dirty guard for AzesSidePanel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { AzesDialogProvider } from '../dialog/AzesDialogProvider';
import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesSidePanel } from './AzesSidePanel';
import { AzesSidePanelProvider, useSidePanel } from './AzesSidePanelProvider';

function Host({ children }: { children: ReactNode }) {
  return (
    <AzesThemeProvider>
      <AzesDialogProvider>
        <AzesSidePanelProvider>{children}</AzesSidePanelProvider>
      </AzesDialogProvider>
    </AzesThemeProvider>
  );
}

function Probe() {
  const settings = useSidePanel('settings');
  const [dirty, setDirty] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => void settings.open()}>
        open-settings
      </button>
      <button type="button" onClick={() => void settings.close()}>
        close-settings
      </button>
      <button type="button" onClick={() => void settings.toggle()}>
        toggle-settings
      </button>
      <button type="button" onClick={() => setDirty(true)}>
        mark-dirty
      </button>
      <output data-testid="open">{String(settings.isOpen)}</output>
      <AzesSidePanel
        id="settings"
        title="Settings panel"
        isDirty={dirty}
        footer={<span>Footer slot</span>}
      >
        <p>Settings body</p>
      </AzesSidePanel>
    </div>
  );
}

describe('AzesSidePanel', () => {
  it('opens and closes a panel via the host drawer', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    expect(screen.getByTestId('open')).toHaveTextContent('false');
    expect(screen.queryByText('Settings body')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'open-settings' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Settings body')).toBeTruthy();
    expect(screen.getByText('Footer slot')).toBeTruthy();
    expect(screen.getByTestId('open')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('false');
    });
  });

  it('toggles the same panel id', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    // Triggers sit under aria-modal; allow hidden when the drawer is open.
    const toggle = () => screen.getByRole('button', { name: 'toggle-settings', hidden: true });
    await user.click(toggle());
    expect(await screen.findByText('Settings body')).toBeTruthy();
    await user.click(toggle());
    await waitFor(() => {
      expect(screen.queryByText('Settings body')).toBeNull();
    });
  });

  it('asks for dirty confirm before closing', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    const openBtn = () => screen.getByRole('button', { name: 'open-settings', hidden: true });
    const dirtyBtn = () => screen.getByRole('button', { name: 'mark-dirty', hidden: true });
    const closeBtn = () => screen.getByRole('button', { name: 'close-settings', hidden: true });

    await user.click(openBtn());
    await screen.findByText('Settings body');
    await user.click(dirtyBtn());
    await user.click(closeBtn());

    const confirm = await screen.findByRole('dialog', { name: /Discard changes/i });
    expect(within(confirm).getByText(/unsaved changes/i)).toBeTruthy();
    await user.click(within(confirm).getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByText('Settings body')).toBeTruthy();

    await user.click(closeBtn());
    const confirmAgain = await screen.findByRole('dialog', { name: /Discard changes/i });
    await user.click(within(confirmAgain).getByRole('button', { name: 'Discard' }));
    await waitFor(() => {
      expect(screen.queryByText('Settings body')).toBeNull();
    });
  });

  it('unregisters and closes when the panel unmounts', async () => {
    const user = userEvent.setup();
    function MountProbe() {
      const settings = useSidePanel('settings');
      const [mounted, setMounted] = useState(true);
      return (
        <div>
          <button type="button" onClick={() => void settings.open()}>
            open
          </button>
          <button type="button" onClick={() => setMounted(false)}>
            unmount-panel
          </button>
          {mounted ? (
            <AzesSidePanel id="settings" title="Ephemeral">
              <p>Ephemeral body</p>
            </AzesSidePanel>
          ) : null}
          <output data-testid="open">{String(settings.isOpen)}</output>
        </div>
      );
    }

    render(
      <Host>
        <MountProbe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByText('Ephemeral body')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'unmount-panel', hidden: true }));
    await waitFor(() => {
      expect(screen.getByTestId('open')).toHaveTextContent('false');
    });
  });

  it('throws outside the provider', () => {
    function Bare() {
      useSidePanel('settings');
      return null;
    }
    expect(() =>
      act(() => {
        render(<Bare />);
      }),
    ).toThrow(/AzesSidePanelProvider/);
  });
});
