/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/Button/Button.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Button tests via @azes/testing native (RNTL-shaped) API
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fireEvent, renderNative, screen } from '@azes/testing/native';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from '../../theme/ThemeProvider.js';
import { Button } from './Button.js';

describe('Button', () => {
  it('fires onPress when enabled', () => {
    const onPress = vi.fn();
    renderNative(
      <ThemeProvider>
        <Button onPress={onPress}>Save</Button>
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = vi.fn();
    renderNative(
      <ThemeProvider>
        <Button disabled onPress={onPress}>
          Save
        </Button>
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes busy accessibility state while loading', () => {
    renderNative(
      <ThemeProvider>
        <Button loading accessibilityLabel="Submit">
          Submit
        </Button>
      </ThemeProvider>,
    );

    expect(screen.getByRole('button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });
});
