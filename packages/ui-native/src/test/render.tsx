/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/test/render.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Lightweight render helper for native component tests
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { type ReactElement } from 'react';
import TestRenderer, { act, type ReactTestInstance } from 'react-test-renderer';

export function render(ui: ReactElement): {
  root: ReactTestInstance;
  unmount: () => void;
} {
  let renderer!: TestRenderer.ReactTestRenderer;

  act(() => {
    renderer = TestRenderer.create(ui);
  });

  return {
    root: renderer.root,
    unmount: () => {
      act(() => {
        renderer.unmount();
      });
    },
  };
}

/** Prefer host nodes so StyleSheet/token props are visible (not the composite wrapper). */
export function findByTestId(root: ReactTestInstance, testID: string): ReactTestInstance {
  const hosts = root.findAll(
    (node) => node.props.testID === testID && typeof node.type === 'string',
  );

  if (hosts[0]) {
    return hosts[0];
  }

  return root.findByProps({ testID });
}

export function press(instance: ReactTestInstance): void {
  const handler = instance.props.onPress as ((event?: unknown) => void) | undefined;
  act(() => {
    handler?.({ type: 'press' });
  });
}

export { act };
