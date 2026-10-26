/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/skeleton/AzesSkeleton.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: AzesSkeleton / Group a11y + wave motion attributes
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesSkeleton } from './AzesSkeleton/AzesSkeleton';
import { AzesSkeletonGroup } from './AzesSkeletonGroup/AzesSkeletonGroup';
import { skeletonCellWidthPercent } from './compositions/TableSkeleton';

describe('AzesSkeleton', () => {
  it('is aria-hidden and marks data-skeleton', () => {
    const { container } = render(
      <AzesThemeProvider>
        <AzesSkeleton shape="text" />
      </AzesThemeProvider>,
    );
    const el = container.querySelector('[data-skeleton]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders multiple text lines when lines > 1', () => {
    const { container } = render(
      <AzesThemeProvider>
        <AzesSkeleton shape="text" lines={3} />
      </AzesThemeProvider>,
    );
    // Outer wrapper + 3 line blocks.
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThanOrEqual(3);
  });
});

describe('AzesSkeletonGroup', () => {
  it('exposes status + busy only while loading', () => {
    const { rerender } = render(
      <AzesThemeProvider>
        <AzesSkeletonGroup loading label="Loading…">
          <span>body</span>
        </AzesSkeletonGroup>
      </AzesThemeProvider>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading…')).toBeTruthy();

    rerender(
      <AzesThemeProvider>
        <AzesSkeletonGroup loading={false} label="Loading…">
          <span>body</span>
        </AzesSkeletonGroup>
      </AzesThemeProvider>,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('body')).toBeTruthy();
  });
});

describe('skeletonCellWidthPercent', () => {
  it('is deterministic', () => {
    expect(skeletonCellWidthPercent(0, 0)).toBe(skeletonCellWidthPercent(0, 0));
    expect(skeletonCellWidthPercent(1, 2)).not.toBe(skeletonCellWidthPercent(2, 1));
  });
});
