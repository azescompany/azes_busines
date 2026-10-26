/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/AzesThemeProvider.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-09-29
 * ║ Purpose: Provider render test for CssBaseline and theme children
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AzesThemeProvider } from './AzesThemeProvider';

describe('AzesThemeProvider', () => {
  it('renders children with the baseline theme mounted', () => {
    render(
      <AzesThemeProvider primary="#0E9384">
        <span>content</span>
      </AzesThemeProvider>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
