/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/layout.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Box / Stack / Text render and token integration tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import { describe, expect, it } from 'vitest';

import { findByTestId, render } from '../test/render.js';
import { ThemeProvider } from '../theme/ThemeProvider.js';
import { Box } from './Box/Box.js';
import { Stack } from './Stack/Stack.js';
import { Text } from './Text/Text.js';

describe('layout primitives', () => {
  it('applies spacing tokens on Box', () => {
    const { root } = render(
      <ThemeProvider>
        <Box testID="box" p={4} gap={2} />
      </ThemeProvider>,
    );

    expect(findByTestId(root, 'box').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          padding: primitives.spacingPx[4],
          gap: primitives.spacingPx[2],
        }),
      ]),
    );
  });

  it('renders Stack in row direction', () => {
    const { root } = render(
      <ThemeProvider>
        <Stack testID="stack" direction="row" gap={3}>
          <Text>One</Text>
          <Text>Two</Text>
        </Stack>
      </ThemeProvider>,
    );

    const stackStyle = findByTestId(root, 'stack').props.style as unknown[];
    expect(stackStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ gap: primitives.spacingPx[3] }),
        expect.objectContaining({ flexDirection: 'row' }),
      ]),
    );
  });

  it('renders Text with accessibility role', () => {
    const { root } = render(
      <ThemeProvider>
        <Text testID="label">Hello AZES</Text>
      </ThemeProvider>,
    );

    expect(findByTestId(root, 'label').props.accessibilityRole).toBe('text');
    expect(findByTestId(root, 'label').props.children).toBe('Hello AZES');
  });
});
