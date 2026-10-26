/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/layout.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Box, Stack, and Text render tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { Box } from './Box/Box';
import { Stack } from './Stack/Stack';
import { Text } from './Text/Text';

describe('layout primitives', () => {
  it('renders Box, Stack, and Text with token-driven styles', () => {
    render(
      <AzesThemeProvider>
        <Stack gap={4}>
          <Box p={2} data-testid="box">
            <Text as="h1" size="xl" weight="bold">
              Heading
            </Text>
            <Text tone="muted">Body</Text>
          </Box>
        </Stack>
      </AzesThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
