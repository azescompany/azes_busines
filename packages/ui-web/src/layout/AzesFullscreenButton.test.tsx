/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/AzesFullscreenButton.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Fullscreen header control — support gate + toggle
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AzesFullscreenButton } from './AzesFullscreenButton.js';

describe('AzesFullscreenButton', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      configurable: true,
      value: true,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    });

    const requestFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.documentElement,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const exitFullscreen = vi.fn(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });
  });

  it('renders enter control and requests fullscreen', async () => {
    const user = userEvent.setup();
    render(<AzesFullscreenButton enterLabel="Enter fullscreen" exitLabel="Exit fullscreen" />);

    const btn = screen.getByRole('button', { name: 'Enter fullscreen' });
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    await user.click(btn);
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: 'Exit fullscreen' })).toBeTruthy();
  });

  it('hides when fullscreen API is unsupported', () => {
    Object.defineProperty(document, 'fullscreenEnabled', {
      configurable: true,
      value: false,
    });
    render(<AzesFullscreenButton enterLabel="Enter fullscreen" exitLabel="Exit fullscreen" />);
    expect(screen.queryByRole('button', { name: 'Enter fullscreen' })).toBeNull();
  });
});
