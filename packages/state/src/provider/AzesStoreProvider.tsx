/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/provider/AzesStoreProvider.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: React-Redux Provider boundary for AZES store
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import type { AzesStore } from '../store/createStore';

export type AzesStoreProviderProps = {
  store: AzesStore;
  children: ReactNode;
};

/**
 * App integration boundary: pass a store from `createAzesStore`.
 * Server state (QueryClient) stays in `@azes/api` / app Query wiring.
 */
export function AzesStoreProvider({ store, children }: AzesStoreProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
