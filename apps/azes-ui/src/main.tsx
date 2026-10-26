/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/main.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-09-29
 * ║ Purpose: Vite entry for the design-system showcase
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.js';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
