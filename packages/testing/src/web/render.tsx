/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/src/web/render.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shared Testing Library render helper for web
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export type WebRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  wrapper?: (props: { children: ReactNode }) => ReactNode;
};

/**
 * Thin wrapper around Testing Library `render` for web packages/apps.
 * Pass an optional provider `wrapper` for integration-style tests.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: WebRenderOptions = {},
): RenderResult {
  const { wrapper: Wrapper, ...rest } = options;

  if (!Wrapper) {
    return render(ui, rest);
  }

  return render(ui, {
    ...rest,
    wrapper: ({ children }) => <>{Wrapper({ children })}</>,
  });
}

export { screen, waitFor, within, fireEvent } from '@testing-library/react';
