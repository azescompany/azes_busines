/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesMainSidebar.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: AzesMainSidebar render + empty nav
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AzesNavProvider } from '../navigation/AzesNavProvider';
import type { AzesNavConfig } from '../navigation/types';
import { AzesUiProvider } from '../settings/AzesSettingsProvider';
import { createAzesSettingsStore } from '../settings/store';
import { AzesMainSidebar } from './AzesMainSidebar';

const nav: AzesNavConfig = [
  {
    id: 'main',
    items: [
      { id: 'overview', title: 'Overview', path: '/m/crm' },
      { id: 'pipeline', title: 'Pipeline', path: '/m/crm/pipeline' },
    ],
  },
];

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

function renderSidebar(config: AzesNavConfig = nav) {
  return render(
    <AzesUiProvider store={createAzesSettingsStore({ storage: 'none' })}>
      <AzesNavProvider router={{ pathname: '/m/crm', toHref: (path) => `#${path}` }}>
        <AzesMainSidebar nav={config} label="Module menu" title="CRM" />
      </AzesNavProvider>
    </AzesUiProvider>,
  );
}

describe('AzesMainSidebar', () => {
  it('renders sticky aside on desktop', () => {
    stubMatchMedia(true);
    renderSidebar();
    expect(screen.getByLabelText('Module menu')).toBeInTheDocument();
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
  });

  it('renders open trigger below layoutQuery', () => {
    stubMatchMedia(false);
    renderSidebar();
    expect(screen.getByLabelText('Open section menu')).toBeInTheDocument();
  });

  it('returns null when nav has no items', () => {
    stubMatchMedia(true);
    const { container } = renderSidebar([{ id: 'empty', items: [] }]);
    expect(container.querySelector('[data-azes-main-sidebar]')).toBeNull();
  });
});
