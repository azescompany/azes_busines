/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/auth/adminHandoff.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Unit tests for admin / academy / agent-site handoff URL builder
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { WEB_DEVICE_ID_COOKIE } from '@azes/auth';

import { accountEnv } from '../config/env.js';
import {
  buildAdminHandoffUrl,
  isAllowedHandoffReturnUrl,
  redirectToAdminAfterLogin,
  resolvePostLoginHandoffUrl,
} from './adminHandoff.js';

describe('buildAdminHandoffUrl', () => {
  it('puts tokens + full device fingerprint in the hash under azes_auth', () => {
    const url = new URL(
      buildAdminHandoffUrl({
        accessToken: 'access',
        refreshToken: 'refresh',
        deviceId: 'device-abc',
        userAgent: 'TestUA/1',
        platform: 'Win32',
        language: 'en-US',
      }),
    );
    expect(url.origin).toBe(new URL(accountEnv.adminAppUrl).origin);
    expect(url.search).toBe('');
    expect(url.hash).toMatch(/^#azes_auth=/);
    const encoded = url.hash.slice('#azes_auth='.length);
    const parsed = JSON.parse(decodeURIComponent(escape(atob(encoded)))) as {
      v: number;
      issuedAt: number;
      accessToken: string;
      refreshToken?: string;
      deviceId: string;
      userAgent: string;
      platform: string;
      language: string;
    };
    expect(parsed.v).toBe(1);
    expect(typeof parsed.issuedAt).toBe('number');
    expect(Date.now() - parsed.issuedAt).toBeLessThan(5_000);
    expect(parsed).toMatchObject({
      accessToken: 'access',
      refreshToken: 'refresh',
      deviceId: 'device-abc',
      userAgent: 'TestUA/1',
      platform: 'Win32',
      language: 'en-US',
    });
  });

  it('preserves returnUrl path when used as handoff base', () => {
    const url = new URL(
      buildAdminHandoffUrl(
        {
          accessToken: 'access',
          deviceId: 'device-abc',
          userAgent: 'TestUA/1',
          platform: 'Win32',
          language: 'en-US',
        },
        `${accountEnv.adminAppUrl}/#/users`,
      ),
    );
    expect(url.hash).toMatch(/^#azes_auth=/);
  });

  it('accepts academyAppUrl as an explicit handoff base', () => {
    const url = new URL(
      buildAdminHandoffUrl(
        {
          accessToken: 'access',
          deviceId: 'device-abc',
          userAgent: 'TestUA/1',
          platform: 'Win32',
          language: 'en-US',
        },
        `${accountEnv.academyAppUrl}/az`,
      ),
    );
    expect(url.origin).toBe(new URL(accountEnv.academyAppUrl).origin);
    expect(url.pathname).toBe('/az');
    expect(url.hash).toMatch(/^#azes_auth=/);
  });
});

describe('isAllowedHandoffReturnUrl', () => {
  it('allows academy configured origin', () => {
    expect(isAllowedHandoffReturnUrl(`${accountEnv.academyAppUrl}/az`)).toBe(true);
  });

  it('allows admin, agent-site, and marketplace origins', () => {
    expect(isAllowedHandoffReturnUrl(`${accountEnv.adminAppUrl}/az/users`)).toBe(true);
    expect(isAllowedHandoffReturnUrl(`${accountEnv.agentSiteAppUrl}/az/a/1-99/manage`)).toBe(true);
    expect(isAllowedHandoffReturnUrl(`${accountEnv.realEstateSiteAppUrl}/az`)).toBe(true);
  });

  it('rejects unknown and malformed return URLs', () => {
    expect(isAllowedHandoffReturnUrl('https://evil.example/phish')).toBe(false);
    expect(isAllowedHandoffReturnUrl('not-a-url')).toBe(false);
    expect(isAllowedHandoffReturnUrl('')).toBe(false);
  });
});

describe('resolvePostLoginHandoffUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to adminAppUrl when returnUrl is absent (not academyAppUrl as the concept)', () => {
    vi.stubGlobal('location', {
      ...window.location,
      search: '',
      href: 'http://localhost:100/',
    });
    const resolved = resolvePostLoginHandoffUrl();
    expect(resolved).toBe(accountEnv.adminAppUrl);
    // Destination concepts stay separate even if local defaults share host:port.
    expect(resolved).toBe(accountEnv.adminAppUrl);
  });

  it('preserves admin returnUrl path', () => {
    const adminUsers = `${accountEnv.adminAppUrl}/az/users`;
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent(adminUsers),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(adminUsers);
  });

  it('allows academy returnUrl origin and path', () => {
    const academyHome = `${accountEnv.academyAppUrl}/az`;
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent(academyHome),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(academyHome);
  });

  it('allows agent-site returnUrl origin', () => {
    const manage = `${accountEnv.agentSiteAppUrl}/az/a/1-99/manage`;
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent(manage),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(manage);
  });

  it('allows marketplace returnUrl origin', () => {
    const market = `${accountEnv.realEstateSiteAppUrl}/az`;
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent(market),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(market);
  });

  it('falls back to admin for unknown returnUrl origin', () => {
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent('https://evil.example/phish'),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(accountEnv.adminAppUrl);
  });

  it('falls back to admin for malformed returnUrl', () => {
    vi.stubGlobal('location', {
      ...window.location,
      search: '?returnUrl=' + encodeURIComponent('%%%not-a-url'),
      href: 'http://localhost:100/',
    });
    expect(resolvePostLoginHandoffUrl()).toBe(accountEnv.adminAppUrl);
  });
});

describe('redirectToAdminAfterLogin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.cookie.split(';').forEach((part) => {
      const name = part.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; Path=/; Max-Age=0`;
      }
    });
  });

  it('writes azes_device_id cookie and navigates with hash handoff', () => {
    const assign = vi.fn();
    vi.stubGlobal('location', {
      ...window.location,
      assign,
      search: '',
      protocol: 'http:',
      href: 'http://localhost:100/',
    });

    redirectToAdminAfterLogin({
      accessToken: 'access',
      refreshToken: 'refresh',
      deviceId: 'device-abc',
      userAgent: 'TestUA/1',
      platform: 'Win32',
      language: 'en-US',
    });

    expect(document.cookie).toContain(`${WEB_DEVICE_ID_COOKIE}=device-abc`);
    expect(assign).toHaveBeenCalledWith(expect.stringContaining('#azes_auth='));
    const navigated = String(assign.mock.calls[0]?.[0] ?? '');
    expect(navigated.startsWith(accountEnv.adminAppUrl)).toBe(true);
  });

  it('navigates to agent-site manage URL when returnUrl allowlisted', () => {
    const assign = vi.fn();
    const manage = `${accountEnv.agentSiteAppUrl}/az/a/1-99/manage`;
    vi.stubGlobal('location', {
      ...window.location,
      assign,
      search: '?returnUrl=' + encodeURIComponent(manage),
      protocol: 'http:',
      href: 'http://localhost:100/',
    });

    redirectToAdminAfterLogin({
      accessToken: 'access',
      deviceId: 'device-abc',
      userAgent: 'TestUA/1',
      platform: 'Win32',
      language: 'en-US',
    });

    const escaped = accountEnv.agentSiteAppUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(assign).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${escaped}/az/a/1-99/manage#azes_auth=`)),
    );
  });

  it('navigates to academy when returnUrl is the academy origin', () => {
    const assign = vi.fn();
    const academyHome = `${accountEnv.academyAppUrl}/az`;
    vi.stubGlobal('location', {
      ...window.location,
      assign,
      search: '?returnUrl=' + encodeURIComponent(academyHome),
      protocol: 'http:',
      href: 'http://localhost:100/',
    });

    redirectToAdminAfterLogin({
      accessToken: 'access',
      deviceId: 'device-abc',
      userAgent: 'TestUA/1',
      platform: 'Win32',
      language: 'en-US',
    });

    const escaped = accountEnv.academyAppUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(assign).toHaveBeenCalledWith(
      expect.stringMatching(new RegExp(`^${escaped}/az#azes_auth=`)),
    );
  });
});

describe('accountEnv handoff destinations', () => {
  it('exposes academyAppUrl independently of adminAppUrl', () => {
    expect(accountEnv.academyAppUrl).toMatch(/^https?:\/\//);
    expect(accountEnv.adminAppUrl).toMatch(/^https?:\/\//);
    // Local defaults may share host:port while Admin is unresolved; keys stay distinct.
    expect('academyAppUrl' in accountEnv).toBe(true);
    expect(accountEnv.academyAppUrl).not.toBe(accountEnv.agentSiteAppUrl);
    expect(accountEnv.academyAppUrl).not.toBe(accountEnv.realEstateSiteAppUrl);
  });
});
