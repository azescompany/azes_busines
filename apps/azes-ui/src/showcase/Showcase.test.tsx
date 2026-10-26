/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/showcase/Showcase.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-19
 * ║ Purpose: Five-phase catalog shell smoke tests (default az + locale)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from '../app/App.js';
import { PHASES } from '../phases/phaseRegistry.js';
import { phaseI18nSegment } from '../i18n/phaseI18nKey.js';
import azShowcase from '../i18n/locales/az/showcase.json';
import enShowcase from '../i18n/locales/en/showcase.json';

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/phase-foundations';
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
});

async function renderShell() {
  render(<App />);
  expect(await screen.findByRole('banner')).toBeInTheDocument();
}

describe('@azes/azes-ui five-phase catalog', () => {
  it('defaults to az and renders the Foundations phase hero', async () => {
    await renderShell();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    const main = screen.getByRole('main');
    expect(
      await within(main).findByRole('heading', {
        level: 1,
        name: azShowcase.phases.foundations.title,
      }),
    ).toBeInTheDocument();
    expect(within(main).getByText(azShowcase.phases.foundations.body)).toBeInTheDocument();
    expect(window.localStorage.getItem('azes.i18n.locale.azes-ui')).toBe('az');
  });

  it('exposes exactly five phase items in the mobile drawer', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: azShowcase.shell.openNav }));
    const nav = await screen.findByRole('navigation', {
      name: azShowcase.shell.primaryNav,
    });

    for (const phase of PHASES) {
      const key = phaseI18nSegment(phase.id) as keyof typeof azShowcase.phases;
      const title = azShowcase.phases[key].title;
      expect(within(nav).getByRole('link', { name: new RegExp(title) })).toBeInTheDocument();
    }
    expect(within(nav).queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: 'Layout' })).not.toBeInTheDocument();
  });

  it('navigates to Controls phase via hash', async () => {
    await renderShell();
    await act(async () => {
      window.location.hash = '#/phase-controls';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: azShowcase.phases.controls.title,
      }),
    ).toBeInTheDocument();
  });

  it('switches language via the locale menu', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: azShowcase.language }));
    await user.click(await screen.findByText('English'));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: enShowcase.phases.foundations.title,
      }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(window.localStorage.getItem('azes.i18n.locale.azes-ui')).toBe('en');
    });
  });

  it('opens settings from the floating gear', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: azShowcase.shell.openSettings }));
    const drawer = await screen.findByRole('dialog', { name: 'Settings' });
    await user.click(within(drawer).getByRole('radio', { name: 'red' }));
    await user.click(within(drawer).getByRole('radio', { name: 'Horizontal' }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('azes.settings.v1') ?? '{}');
      expect(stored).toMatchObject({ primary: 'red', navLayout: 'horizontal' });
    });
  });

  it('opens AI from the rail', async () => {
    const user = userEvent.setup();
    await renderShell();

    await user.click(await screen.findByRole('button', { name: azShowcase.shell.openNav }));
    const nav = await screen.findByRole('navigation', {
      name: azShowcase.shell.primaryNav,
    });
    await user.click(within(nav).getByRole('button', { name: /AI/i }));
    expect(await screen.findByRole('heading', { name: azShowcase.ai.title })).toBeInTheDocument();
    expect(screen.getByText(azShowcase.ai.empty)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(azShowcase.ai.inputPlaceholder)).toBeInTheDocument();
  });
});
