/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/backdrop/backdrop.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Glass MuiBackdrop vs invisible Menu backdrop proof
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Modal from '@mui/material/Modal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { AzesMenu } from '../menu/AzesMenu';
import { AzesSidePanel } from '../side-panel/AzesSidePanel';
import { AzesSidePanelProvider, useSidePanel } from '../side-panel/AzesSidePanelProvider';
import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { createAzesTheme } from '../theme/createAzesTheme';
import { getBackdropSx } from './backdropStyles';

function Host({ children }: { children: ReactNode }) {
  return <AzesThemeProvider>{children}</AzesThemeProvider>;
}

function styleOf(el: Element | null): CSSStyleDeclaration {
  if (!el) throw new Error('missing element');
  return window.getComputedStyle(el);
}

function isTransparent(bg: string): boolean {
  return bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
}

describe('getBackdropSx', () => {
  it('applies glass color-mix + blur for visible backdrops', () => {
    const theme = createAzesTheme({ colorScheme: 'light' });
    const sx = getBackdropSx(theme) as Record<string, unknown>;
    expect(String(sx.backgroundColor)).toContain('color-mix');
    expect(String(sx.backdropFilter)).toContain(`blur(${theme.azes.backdrop.blur}px)`);
    expect(String(sx.WebkitBackdropFilter)).toContain('saturate');
    expect(JSON.stringify(sx)).toContain('prefers-reduced-transparency');
    expect(JSON.stringify(sx)).toContain('@supports not');
  });

  it('keeps invisible backdrops transparent with no blur', () => {
    const theme = createAzesTheme({ colorScheme: 'light' });
    const sx = getBackdropSx(theme, { invisible: true }) as Record<string, unknown>;
    expect(sx.backgroundColor).toBe('transparent');
    expect(sx.backdropFilter).toBe('none');
  });
});

describe('MuiBackdrop glass vs Menu', () => {
  it('Dialog shows a visible glass backdrop', () => {
    render(
      <Host>
        <Dialog open aria-labelledby="d">
          <h2 id="d">Dialog</h2>
        </Dialog>
      </Host>,
    );
    const backdrop = document.querySelector('.MuiBackdrop-root:not(.MuiBackdrop-invisible)');
    expect(backdrop).toBeTruthy();
    expect(isTransparent(styleOf(backdrop).backgroundColor)).toBe(false);
  });

  it('temporary Drawer shows a visible backdrop; permanent does not', () => {
    const { unmount } = render(
      <Host>
        <Drawer open anchor="left" variant="temporary">
          <div>temp</div>
        </Drawer>
      </Host>,
    );
    expect(document.querySelector('.MuiDrawer-modal .MuiBackdrop-root')).toBeTruthy();
    unmount();

    render(
      <Host>
        <Drawer open anchor="left" variant="permanent">
          <div>perm</div>
        </Drawer>
      </Host>,
    );
    expect(document.querySelector('.MuiDrawer-modal')).toBeNull();
    expect(document.querySelector('.MuiBackdrop-root')).toBeNull();
  });

  it('Modal shows a visible backdrop', () => {
    render(
      <Host>
        <Modal open aria-label="m">
          <div>body</div>
        </Modal>
      </Host>,
    );
    expect(document.querySelector('.MuiBackdrop-root:not(.MuiBackdrop-invisible)')).toBeTruthy();
  });

  it('AzesMenu backdrop is invisible (no glass)', async () => {
    const user = userEvent.setup();
    render(
      <Host>
        <AzesMenu
          aria-label="Demo menu"
          items={[{ id: 'a', label: 'Alpha' }]}
          trigger={({ props, onClick }) => (
            <button type="button" {...props} onClick={onClick}>
              open-menu
            </button>
          )}
        />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open-menu' }));
    expect(await screen.findByRole('menu', { name: 'Demo menu' })).toBeTruthy();

    const invisible = document.querySelector('.MuiBackdrop-invisible');
    expect(invisible).toBeTruthy();
    expect(isTransparent(styleOf(invisible).backgroundColor)).toBe(true);
    // jsdom often omits computed backdrop-filter; prove the theme helper clears it.
    const cleared = getBackdropSx(createAzesTheme(), { invisible: true }) as Record<
      string,
      unknown
    >;
    expect(cleared.backdropFilter).toBe('none');
    expect(cleared.backgroundColor).toBe('transparent');
  });

  it('raw MUI Menu uses invisible backdrop', async () => {
    const user = userEvent.setup();
    function MenuOnly() {
      const [anchor, setAnchor] = useState<HTMLElement | null>(null);
      return (
        <>
          <button type="button" onClick={(e) => setAnchor(e.currentTarget)}>
            raw-menu
          </button>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => setAnchor(null)}>Item</MenuItem>
          </Menu>
        </>
      );
    }
    render(
      <Host>
        <MenuOnly />
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'raw-menu' }));
    expect(document.querySelector('.MuiBackdrop-invisible')).toBeTruthy();
  });

  it('SidePanel host uses a visible (non-invisible) backdrop', async () => {
    const user = userEvent.setup();
    function Probe() {
      const panel = useSidePanel('settings');
      return (
        <>
          <button type="button" onClick={() => void panel.open()}>
            open-panel
          </button>
          <AzesSidePanel id="settings" title="Settings">
            <p>body</p>
          </AzesSidePanel>
        </>
      );
    }
    render(
      <Host>
        <AzesSidePanelProvider>
          <Probe />
        </AzesSidePanelProvider>
      </Host>,
    );
    await user.click(screen.getByRole('button', { name: 'open-panel' }));
    expect(await screen.findByRole('dialog')).toBeTruthy();
    const backdrop = document.querySelector('.MuiDrawer-modal .MuiBackdrop-root');
    expect(backdrop).toBeTruthy();
    expect(backdrop?.classList.contains('MuiBackdrop-invisible')).toBe(false);
  });
});
