/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/testing/src/native/render.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: RNTL-compatible native render helpers for Vitest
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/**
 * Vitest cannot execute real `react-native` (Flow syntax). Full
 * `@testing-library/react-native` therefore fails under Node/Vitest.
 * This module provides an RNTL-shaped API (`render`, `screen`, `fireEvent`)
 * on `react-test-renderer` for monorepo unit/component tests.
 * Keep `@testing-library/react-native` installed for Metro/Jest runners.
 */

import { type ReactElement, type ReactNode } from 'react';
import TestRenderer, { act, type ReactTestInstance } from 'react-test-renderer';

export type NativeRenderResult = {
  root: ReactTestInstance;
  unmount: () => void;
  getByRole: (role: string) => ReactTestInstance;
  getByLabelText: (label: string) => ReactTestInstance;
  getByText: (text: string | RegExp) => ReactTestInstance;
  getByTestId: (testID: string) => ReactTestInstance;
};

export type NativeRenderOptions = {
  wrapper?: (props: { children: ReactNode }) => ReactNode;
};

let lastResult: NativeRenderResult | null = null;

function collectText(node: ReactTestInstance | string): string {
  if (typeof node === 'string') return node;
  const children = node.children;
  if (typeof children === 'string') return children;
  if (!Array.isArray(children)) return '';
  return children.map((child) => (typeof child === 'string' ? child : collectText(child))).join('');
}

function matchesText(node: ReactTestInstance, text: string | RegExp): boolean {
  const joined = collectText(node);
  if (!joined) return false;
  return typeof text === 'string' ? joined.includes(text) || joined === text : text.test(joined);
}

function createQueries(root: ReactTestInstance) {
  return {
    getByRole: (role: string) => root.findByProps({ accessibilityRole: role }),
    getByLabelText: (label: string) => root.findByProps({ accessibilityLabel: label }),
    getByText: (text: string | RegExp) =>
      root.find((node: ReactTestInstance) => matchesText(node, text)),
    getByTestId: (testID: string) => {
      const hosts = root.findAll(
        (node: ReactTestInstance) => node.props.testID === testID && typeof node.type === 'string',
      );
      if (hosts[0]) return hosts[0];
      return root.findByProps({ testID });
    },
  };
}

export function renderNative(
  ui: ReactElement,
  options: NativeRenderOptions = {},
): NativeRenderResult {
  const { wrapper: Wrapper } = options;
  const tree = Wrapper ? <>{Wrapper({ children: ui })}</> : ui;

  let renderer!: TestRenderer.ReactTestRenderer;
  act(() => {
    renderer = TestRenderer.create(tree);
  });

  const queries = createQueries(renderer.root);
  const result: NativeRenderResult = {
    root: renderer.root,
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
      if (lastResult === result) lastResult = null;
    },
    ...queries,
  };

  lastResult = result;
  return result;
}

export const screen: Pick<
  NativeRenderResult,
  'getByRole' | 'getByLabelText' | 'getByText' | 'getByTestId' | 'root'
> = {
  get root() {
    if (!lastResult) throw new Error('No native render in progress. Call renderNative() first.');
    return lastResult.root;
  },
  getByRole: (role) => {
    if (!lastResult) throw new Error('No native render in progress. Call renderNative() first.');
    return lastResult.getByRole(role);
  },
  getByLabelText: (label) => {
    if (!lastResult) throw new Error('No native render in progress. Call renderNative() first.');
    return lastResult.getByLabelText(label);
  },
  getByText: (text) => {
    if (!lastResult) throw new Error('No native render in progress. Call renderNative() first.');
    return lastResult.getByText(text);
  },
  getByTestId: (testID) => {
    if (!lastResult) throw new Error('No native render in progress. Call renderNative() first.');
    return lastResult.getByTestId(testID);
  },
};

export const fireEvent = {
  press: (instance: ReactTestInstance, event: unknown = { type: 'press' }): void => {
    const handler = instance.props.onPress as ((e?: unknown) => void) | undefined;
    act(() => {
      handler?.(event);
    });
  },
};

export { act };
export type { ReactTestInstance };
