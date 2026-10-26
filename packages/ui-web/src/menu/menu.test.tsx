/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/menu/menu.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: AzesMenu open/close, a11y, selection, typeahead
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesMenu } from './AzesMenu';
import type { AzesMenuItem } from './types';

function Host({ children }: { children: ReactNode }) {
  return <AzesThemeProvider>{children}</AzesThemeProvider>;
}

const ITEMS: AzesMenuItem[] = [
  { id: 'az', label: 'Azərbaycan', endAdornment: 'AZ' },
  { id: 'en', label: 'English', endAdornment: 'EN' },
  { type: 'divider' },
  { type: 'header', id: 'grp', label: 'More' },
  { id: 'ru', label: 'Русский', endAdornment: 'RU' },
  { id: 'danger', label: 'Delete', danger: true },
  { id: 'off', label: 'Disabled', disabled: true },
];

describe('AzesMenu', () => {
  it('opens from trigger and exposes menu aria', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <AzesMenu
          aria-label="Languages"
          items={ITEMS}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );

    const trigger = screen.getByRole('button', { name: 'open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    const menu = await screen.findByRole('menu', { name: 'Languages' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: /Azərbaycan/i })).toBeTruthy();
    expect(within(menu).getByRole('separator')).toBeTruthy();
  });

  it('selects an item, closes, and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Host>
        <AzesMenu
          aria-label="Languages"
          items={[{ id: 'en', label: 'English', onSelect }]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );

    const trigger = screen.getByRole('button', { name: 'open' });
    await user.click(trigger);
    await user.click(await screen.findByRole('menuitem', { name: 'English' }));
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
    expect(trigger).toHaveFocus();
  });

  it('supports single selection aria-checked', async () => {
    const user = userEvent.setup();
    function Probe() {
      const [value, setValue] = useState('en');
      return (
        <AzesMenu
          aria-label="Languages"
          selectionMode="single"
          items={[
            {
              id: 'en',
              label: 'English',
              selected: value === 'en',
              onSelect: () => setValue('en'),
            },
            {
              id: 'az',
              label: 'Azərbaycan',
              selected: value === 'az',
              onSelect: () => setValue('az'),
            },
          ]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      );
    }
    render(
      <Host>
        <Probe />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const en = await screen.findByRole('menuitemradio', { name: 'English' });
    expect(en).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('menuitemradio', { name: 'Azərbaycan' }));
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByRole('menuitemradio', { name: 'Azərbaycan' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('closes on Escape and skips disabled items', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <AzesMenu
          aria-label="Languages"
          items={ITEMS}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByRole('menu')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Disabled' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  it('typeahead jumps to Azerbaijani characters', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <AzesMenu
          aria-label="Languages"
          items={[
            { id: 'en', label: 'English' },
            { id: 'az', label: 'Azərbaycan' },
            { id: 'sh', label: 'Şəki' },
          ]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const menu = await screen.findByRole('menu');
    await user.type(menu, 'ş');
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Şəki' })).toHaveFocus();
    });
  });

  it('keeps the menu open when closeOnSelect is false', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Host>
        <AzesMenu
          aria-label="Tools"
          items={[{ id: 'pin', label: 'Pin', closeOnSelect: false, onSelect }]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Pin' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('shows empty and loading states', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <Host>
        <AzesMenu
          aria-label="Empty"
          items={[]}
          emptyLabel="Nothing here"
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(await screen.findByText('Nothing here')).toBeTruthy();
    unmount();

    render(
      <Host>
        <AzesMenu
          aria-label="Loading"
          items={[]}
          loading
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('applies paper radius as a CSS px length (not MUI shape multiplier)', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <AzesMenu
          aria-label="Radius"
          items={[{ id: 'a', label: 'One' }]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    const menu = await screen.findByRole('menu', { name: 'Radius' });
    const paper = menu.closest('.MuiPaper-root') as HTMLElement | null;
    expect(paper).toBeTruthy();
    expect(getComputedStyle(paper!).borderRadius).toBe('8px');
  });
});
