/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/test/setup.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-04
 * ║ Purpose: Vitest DOM setup for @azes/azes-ui, including jsdom gaps used by MUI X
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

// Sections are lazy chunks; the first import of each module is transformed on demand.
configure({ asyncUtilTimeout: 15_000 });

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
