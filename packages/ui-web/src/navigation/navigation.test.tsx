/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/navigation.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Navigation filtering, active matching, depth limit and renderer a11y
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesNavHorizontalBar } from './AzesNavHorizontalBar';
import { AzesNavList } from './AzesNavList';
import { AzesNavMiniList } from './AzesNavMiniList';
import { AzesNavProvider } from './AzesNavProvider';
import { filterNav, isNavItemActive, limitNavDepth, resolveActiveTrail } from './nav-utils';
import type { AzesAccessContext, AzesNavConfig } from './types';

const config: AzesNavConfig = [
  {
    id: 'main',
    subheader: 'Main',
    items: [
      { id: 'home', title: 'Home', path: '/' },
      {
        id: 'reports',
        title: 'Reports',
        path: '/reports',
        access: { permissions: ['reports.read'] },
      },
      {
        id: 'settings',
        title: 'Settings',
        children: [
          { id: 'profile', title: 'Profile', path: '/settings/profile' },
          {
            id: 'billing',
            title: 'Billing',
            path: '/settings/billing',
            access: { roles: ['owner'] },
          },
        ],
      },
    ],
  },
  {
    id: 'admin',
    subheader: 'Admin',
    access: { featureFlag: 'admin' },
    items: [{ id: 'users', title: 'Users', path: '/admin/users' }],
  },
];

const denyAll: AzesAccessContext = {
  can: () => false,
  hasRole: () => false,
  isEnabled: () => false,
};

function wrap(pathname: string, node: ReactNode, access?: AzesAccessContext) {
  return render(
    <AzesThemeProvider>
      <AzesNavProvider router={{ pathname, toHref: (p) => `#${p}` }} access={access}>
        <nav aria-label="Primary">{node}</nav>
      </AzesNavProvider>
    </AzesThemeProvider>,
  );
}

describe('nav utils', () => {
  it('filters items and groups by access and drops empty parents', () => {
    const filtered = filterNav(config, denyAll);
    expect(filtered).toHaveLength(1);
    const ids = filtered[0]?.items.map((i) => i.id);
    expect(ids).toEqual(['home', 'settings']);
    expect(filtered[0]?.items[1]?.children?.map((c) => c.id)).toEqual(['profile']);
  });

  it('keeps the original objects when nothing is filtered', () => {
    const allow: AzesAccessContext = {
      can: () => true,
      hasRole: () => true,
      isEnabled: () => true,
    };
    const filtered = filterNav(config, allow);
    expect(filtered[0]).toBe(config[0]);
  });

  it('matches exact for root and prefix otherwise', () => {
    expect(isNavItemActive({ id: 'h', title: 'H', path: '/' }, '/reports')).toBe(false);
    expect(isNavItemActive({ id: 'h', title: 'H', path: '/' }, '/')).toBe(true);
    expect(isNavItemActive({ id: 'r', title: 'R', path: '/reports' }, '/reports/2026')).toBe(true);
    expect(isNavItemActive({ id: 'r', title: 'R', path: '/reports' }, '/reportsx')).toBe(false);
    expect(
      isNavItemActive({ id: 'r', title: 'R', path: '/reports', match: 'exact' }, '/reports/1'),
    ).toBe(false);
  });

  it('resolves the deepest active trail', () => {
    expect(resolveActiveTrail(config, '/settings/profile')).toEqual(['settings', 'profile']);
    expect(resolveActiveTrail(config, '/nowhere')).toEqual([]);
  });

  it('cuts children deeper than the maximum depth', () => {
    const deep: AzesNavConfig = [
      {
        id: 'g',
        items: [
          {
            id: 'a',
            title: 'A',
            children: [
              {
                id: 'b',
                title: 'B',
                children: [{ id: 'c', title: 'C', children: [{ id: 'd', title: 'D' }] }],
              },
            ],
          },
        ],
      },
    ];
    const cut: string[] = [];
    const limited = limitNavDepth(deep, (id) => cut.push(id));
    expect(cut).toEqual(['c']);
    expect(limited[0]?.items[0]?.children?.[0]?.children?.[0]?.children).toBeUndefined();
  });
});

describe('AzesNavList', () => {
  it('marks the current page and expands its parent', () => {
    wrap('/settings/profile', <AzesNavList config={config} />);
    const profile = screen.getByRole('link', { name: 'Profile' });
    expect(profile).toHaveAttribute('aria-current', 'page');
    expect(profile).toHaveAttribute('href', '#/settings/profile');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('hides denied items and toggles groups by keyboard-accessible buttons', () => {
    wrap('/', <AzesNavList config={config} />, denyAll);
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Settings' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onNavigate after a link is chosen', () => {
    const onNavigate = vi.fn();
    wrap('/', <AzesNavList config={config} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('link', { name: 'Reports' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe('AzesNavMiniList and AzesNavHorizontalBar', () => {
  it('mini renders a letter fallback and opens children in a menu', () => {
    wrap('/settings/billing', <AzesNavMiniList config={config} />);
    const settings = screen.getByRole('button', { name: 'Settings' });
    expect(settings).toHaveAttribute('aria-haspopup', 'menu');
    fireEvent.click(settings);
    const menu = screen.getByRole('menu', { name: 'Settings' });
    expect(within(menu).getByRole('menuitem', { name: 'Billing' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('horizontal flattens groups into one list of top-level items', () => {
    wrap('/reports', <AzesNavHorizontalBar config={config} />);
    const reports = screen.getByRole('link', { name: 'Reports' });
    expect(reports).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    expect(getComputedStyle(reports).flexDirection).toBe('column');
    expect(getComputedStyle(reports).whiteSpace).toBe('nowrap');
  });
});
