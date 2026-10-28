/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/LoginPage.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-20
 * ║ Purpose: Account login form smoke — Academy brand copy, device meta, logout-reason
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { renderWithProviders, screen, waitFor } from '@azes/testing/web';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../app/App.js';
import { redirectToAdminAfterLogin } from '../../auth/adminHandoff.js';
import { LOGOUT_REASON_KEY } from '../../auth/logoutReason.js';

const mutateAsync = vi.fn();

vi.mock('@azes/api/azes/auth', () => ({
  usePostApiV1AuthLogin: () => ({
    mutateAsync,
    isPending: false,
  }),
  postApiV1AuthLogout: vi.fn(async () => ({ ok: true })),
}));

vi.mock('@azes/api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getOrCreateDeviceMeta: vi.fn(async () => ({
      deviceId: 'a1b2c3d4e5f607182930aabbccddeeff',
      userAgent: 'TestAgent/1.0',
      platform: 'Win32',
      language: 'az-AZ',
    })),
  };
});

vi.mock('../../auth/adminHandoff.js', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    redirectToAdminAfterLogin: vi.fn(),
  };
});

describe('@azes/account login', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    vi.mocked(redirectToAdminAfterLogin).mockReset();
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  // Heavy App mount under turbo parallel load — default 5s flakes in CI/monorepo.
  it('renders login identity for smoke e2e parity', { timeout: 15_000 }, async () => {
    renderWithProviders(<App />);
    // Wait for form (boot loader also uses brand aria-label on the same SVG).
    await screen.findByRole('heading', { level: 1, name: 'Daxil ol' });
    expect(screen.getByText('AZES Academy-yə xoş gəlmisiniz')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'AZES Academy' })).toBeTruthy();
    expect(screen.queryByText('AZES Academy', { exact: true })).toBeNull();
    expect(screen.queryByText(/web-vite/i)).toBeNull();
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Bağla' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Şifrəni unutdunuz?' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Dil' })).toHaveLength(1);

    const username = screen.getByRole('textbox', { name: /İstifadəçi adı/i });
    const password = screen.getByLabelText(/Şifrə/i, { selector: 'input' });
    expect(username.getAttribute('spellcheck')).toBe('false');
    expect(username.getAttribute('autocomplete')).toBe('username');
    expect(password.getAttribute('autocomplete')).toBe('current-password');
  });

  it('shows logout reason once from sessionStorage and clears it', async () => {
    sessionStorage.setItem(LOGOUT_REASON_KEY, 'Sessiya sonlandırıldı.');
    renderWithProviders(<App />);
    expect(await screen.findByText('Sessiya sonlandırıldı.')).toBeTruthy();
    expect(sessionStorage.getItem(LOGOUT_REASON_KEY)).toBeNull();

    window.history.replaceState(null, '', '/');
  });

  it('blocks empty submit and hands off tokens + login deviceId to admin', async () => {
    const user = userEvent.setup();
    const access = [
      'hdr',
      btoa(JSON.stringify({ UserId: 'u-1', RoleId: '1', exp: 1_900_000_000 }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, ''),
      'sig',
    ].join('.');
    mutateAsync.mockResolvedValue({ accessToken: access, refreshToken: 'refresh' });

    renderWithProviders(<App />);
    await screen.findByRole('heading', { level: 1, name: 'Daxil ol' });

    await user.click(screen.getByRole('button', { name: 'Daxil ol' }));
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/2 fields need attention/i)).toBeTruthy();

    await user.type(screen.getByRole('textbox', { name: /İstifadəçi adı/i }), 'admin');
    await user.type(screen.getByLabelText(/Şifrə/i, { selector: 'input' }), 'secret-pass');
    await user.click(screen.getByRole('button', { name: 'Daxil ol' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        data: {
          username: 'admin',
          password: 'secret-pass',
          deviceId: 'a1b2c3d4e5f607182930aabbccddeeff',
          userAgent: 'TestAgent/1.0',
          platform: 'Win32',
          language: 'az-AZ',
        },
      });
    });

    await waitFor(
      () => {
        expect(redirectToAdminAfterLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken: access,
            refreshToken: 'refresh',
            deviceId: 'a1b2c3d4e5f607182930aabbccddeeff',
            userAgent: expect.any(String),
            platform: expect.any(String),
            language: expect.any(String),
          }),
        );
      },
      { timeout: 20_000 },
    );
  }, 25_000);
});
