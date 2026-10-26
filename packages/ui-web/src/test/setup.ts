/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/test/setup.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Testing Library jest-dom matchers and jsdom gaps (ResizeObserver) for Vitest
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '@testing-library/jest-dom/vitest';

// MUI X measures containers with ResizeObserver, which jsdom does not implement.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
