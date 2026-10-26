/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/charts/mui-x.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Chart palette and accessible titles
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAzesTheme } from '../theme/createAzesTheme';
import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesBarChart, azesChartPalette } from './AzesCharts';

describe('charts', () => {
  it('builds the palette from theme variables', () => {
    const palette = azesChartPalette(createAzesTheme());
    expect(palette).toHaveLength(6);
    expect(palette[0]).toMatch(/^var\(--[a-z]+-palette-primary-main/);
  });

  it('wraps charts in a titled figure', () => {
    render(
      <AzesThemeProvider>
        <AzesBarChart
          title="Revenue by month"
          width={400}
          xAxis={[{ scaleType: 'band', data: ['Jan', 'Feb'] }]}
          series={[{ data: [4, 6], label: 'Revenue' }]}
        />
      </AzesThemeProvider>,
    );
    expect(screen.getByRole('group', { name: 'Revenue by month' })).toBeInTheDocument();
  });
});
