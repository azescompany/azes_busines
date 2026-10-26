/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/dialog.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-11
 * ║ Purpose: Promise queue, async confirm, a11y defaults for AzesDialog
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { createAzesTheme } from '../theme/createAzesTheme';
import { AzesDialogProvider, useAzesDialog } from './AzesDialogProvider';
import { closeDialog, openDialog } from './dialogBridge';

function Host({ children }: { children: ReactNode }) {
  return (
    <AzesThemeProvider>
      <AzesDialogProvider>{children}</AzesDialogProvider>
    </AzesThemeProvider>
  );
}

function Probe() {
  const dialog = useAzesDialog();
  const [last, setLast] = useState<string>('none');

  return (
    <div>
      <output data-testid="last">{last}</output>
      <button
        type="button"
        onClick={() => {
          void dialog.confirm({ title: 'Confirm title', description: 'Confirm body' }).then((v) => {
            setLast(`confirm:${String(v)}`);
          });
        }}
      >
        open-confirm
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog.danger({ title: 'Delete item', description: 'Cannot undo' }).then((v) => {
            setLast(`danger:${String(v)}`);
          });
        }}
      >
        open-danger
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog
            .notify({ variant: 'success', title: 'Saved', description: 'All good' })
            .then(() => {
              setLast('notify:done');
            });
        }}
      >
        open-notify
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog
            .confirm({
              title: 'Async',
              onConfirm: async () => {
                await new Promise((r) => {
                  setTimeout(r, 20);
                });
              },
            })
            .then((v) => setLast(`async:${String(v)}`));
        }}
      >
        open-async-ok
      </button>
      <button
        type="button"
        onClick={() => {
          let attempts = 0;
          void dialog
            .confirm({
              title: 'Async fail',
              onConfirm: async () => {
                attempts += 1;
                if (attempts === 1) {
                  throw new Error('boom');
                }
              },
            })
            .then((v) => setLast(`asyncfail:${String(v)}`));
        }}
      >
        open-async-fail
      </button>
      <button
        type="button"
        onClick={() => {
          void dialog.confirm({ title: 'First' }).then((v) => setLast(`q1:${String(v)}`));
          void dialog.confirm({ title: 'Second' }).then((v) => setLast(`q2:${String(v)}`));
        }}
      >
        open-queue
      </button>
      <button type="button" onClick={() => dialog.close()}>
        close-api
      </button>
    </div>
  );
}

describe('AzesDialogProvider', () => {
  afterEach(() => {
    closeDialog();
  });

  it('resolves confirm true / cancel false', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-confirm' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Confirm title')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('confirm:true');
    });

    await user.click(screen.getByRole('button', { name: 'open-confirm' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('confirm:false');
    });
  });

  it('danger uses alertdialog role and focuses cancel', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-danger' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Delete item')).toBeTruthy();
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
    expect(cancel).toHaveFocus();

    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('danger:false');
    });
  });

  it('notify resolves void with a single OK button', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-notify' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Cancel' })).toBeNull();
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('notify:done');
    });
  });

  it('keeps dialog open on async onConfirm error and retries', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-async-fail' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('boom')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('asyncfail:true');
    });
  });

  it('closes after successful async onConfirm', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-async-ok' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('async:true');
    });
  });

  it('keeps confirm paper overflow hidden while busy (no scrollbar jump)', async () => {
    const user = userEvent.setup();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    function BusyProbe() {
      const dialog = useAzesDialog();
      return (
        <button
          type="button"
          onClick={() => {
            void dialog.confirm({
              title: 'Busy',
              onConfirm: async () => {
                await gate;
              },
            });
          }}
        >
          open-busy
        </button>
      );
    }

    render(
      <Host>
        <BusyProbe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-busy' }));
    const dialog = await screen.findByRole('dialog');
    const confirm = within(dialog).getByRole('button', { name: 'Confirm' });
    const widthBefore = confirm.getBoundingClientRect().width;

    await user.click(confirm);
    await waitFor(() => {
      expect(within(dialog).getByRole('button', { name: 'Working…' })).toHaveAttribute(
        'aria-busy',
        'true',
      );
    });
    const busy = within(dialog).getByRole('button', { name: 'Working…' });
    expect(busy.getBoundingClientRect().width).toBeGreaterThanOrEqual(widthBefore - 1);

    const paper = dialog.closest('.MuiDialog-paper') ?? dialog;
    expect(getComputedStyle(paper).overflow).toMatch(/hidden/);

    await act(async () => {
      release();
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('queues a second dialog until the first settles', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-queue' }));
    expect(await screen.findByText('First')).toBeTruthy();
    expect(screen.queryByText('Second')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.getByText('Second')).toBeTruthy();
    });
    expect(screen.getByTestId('last')).toHaveTextContent('q1:true');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByTestId('last')).toHaveTextContent('q2:false');
    });
  });

  it('resolves pending promises false on provider unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Host>
        <Probe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-confirm' }));
    await screen.findByRole('dialog');

    let settled: boolean | undefined;
    const p = openDialog({ title: 'Bridge queued' }).then((v) => {
      settled = v;
    });

    unmount();
    await p;
    expect(settled).toBe(false);
  });

  it('exposes openDialog bridge while mounted', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <Probe />
      </Host>,
    );

    const p = openDialog({ title: 'From bridge', variant: 'info' });
    expect(await screen.findByText('From bridge')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await expect(p).resolves.toBe(true);
  });

  it('renders without error across brand seeds and densities', () => {
    for (const primary of ['teal', 'violet', 'red'] as const) {
      for (const density of ['comfortable', 'compact'] as const) {
        const { unmount } = render(
          <AzesThemeProvider primary={primary} density={density}>
            <AzesDialogProvider>
              <Probe />
            </AzesDialogProvider>
          </AzesThemeProvider>,
        );
        expect(createAzesTheme({ primary, density }).azes.dialog.iconMixPercent).toBe(12);
        unmount();
      }
    }
  });

  it('throws outside the provider', () => {
    function Bare() {
      useAzesDialog();
      return null;
    }
    expect(() =>
      act(() => {
        render(<Bare />);
      }),
    ).toThrow(/AzesDialogProvider/);
  });

  it('supports custom gallery options: lg, close, hideFooter, paddingless', async () => {
    const user = userEvent.setup();
    function GalleryProbe() {
      const dialog = useAzesDialog();
      return (
        <button
          type="button"
          onClick={() => {
            void dialog.open({
              variant: 'custom',
              title: 'Gallery',
              maxWidth: 'lg',
              showCloseButton: true,
              hideFooter: true,
              hideCancel: true,
              paddingless: true,
              fullScreenOnMobile: true,
              icon: false,
              content: <div data-testid="gallery-body">Gallery body</div>,
            });
          }}
        >
          open-gallery
        </button>
      );
    }

    render(
      <Host>
        <GalleryProbe />
      </Host>,
    );

    await user.click(screen.getByRole('button', { name: 'open-gallery' }));
    const dialogEl = await screen.findByRole('dialog');
    expect(within(dialogEl).getByTestId('gallery-body')).toBeTruthy();
    expect(within(dialogEl).queryByRole('button', { name: 'Confirm' })).toBeNull();
    expect(within(dialogEl).getByRole('button', { name: 'Close' })).toBeTruthy();
    await user.click(within(dialogEl).getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});
