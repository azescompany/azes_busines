/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/table/AzesTableLabelsContext.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: App-wide AzesTable label defaults (empty Paper + chrome)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AzesTableLabels } from './AzesTable';

/** English package fallbacks — apps should inject locale via `AzesUiProvider`. */
export const DEFAULT_AZES_TABLE_LABELS: AzesTableLabels = {
  rowsPerPage: 'Rows per page',
  displayedRows: (from, to, count) =>
    count === -1 ? `${from}–${to} of more than ${to}` : `${from}–${to} of ${count}`,
  previousPage: 'Previous page',
  nextPage: 'Next page',
  emptyTitle: 'No data found',
  empty: 'There is no information to display.',
  selectAll: 'Select all rows on this page',
  selectRow: 'Select row',
};

const AzesTableLabelsContext = createContext<Partial<AzesTableLabels> | null>(null);

export type AzesTableLabelsProviderProps = {
  labels?: Partial<AzesTableLabels>;
  children: ReactNode;
};

/** Inject default table chrome / empty labels (usually from app i18n). */
export function AzesTableLabelsProvider({ labels, children }: AzesTableLabelsProviderProps) {
  const value = useMemo(() => labels ?? null, [labels]);
  return (
    <AzesTableLabelsContext.Provider value={value}>{children}</AzesTableLabelsContext.Provider>
  );
}

/** App defaults from `AzesUiProvider` / `AzesTableLabelsProvider` (null when absent). */
export function useOptionalAzesTableLabels(): Partial<AzesTableLabels> | null {
  return useContext(AzesTableLabelsContext);
}

/** Merge package defaults ← provider ← per-table props. */
export function resolveAzesTableLabels(
  labels: Partial<AzesTableLabels> | undefined,
  provider: Partial<AzesTableLabels> | null | undefined,
): AzesTableLabels {
  return {
    ...DEFAULT_AZES_TABLE_LABELS,
    ...(provider ?? undefined),
    ...(labels ?? undefined),
  };
}
