/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/theme/ThemeProvider.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: ThemeProvider / useTheme integration tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { getTheme } from '@azes/design-tokens';
import { describe, expect, it } from 'vitest';

import { Text } from '../components/Text/Text.js';
import { findByTestId, render } from '../test/render.js';
import { ThemeProvider, useTheme } from './ThemeProvider.js';

function ThemeProbe() {
  const theme = useTheme();
  return <Text testID="theme-name">{theme.name}</Text>;
}

describe('ThemeProvider', () => {
  it('provides the light theme by default', () => {
    const { root } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(findByTestId(root, 'theme-name').props.children).toBe('light');
  });

  it('switches to the dark theme', () => {
    const { root } = render(
      <ThemeProvider theme="dark" testID="theme-root">
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(findByTestId(root, 'theme-name').props.children).toBe('dark');
    expect(findByTestId(root, 'theme-root').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: getTheme('dark').color.background.canvas,
        }),
      ]),
    );
  });
});
