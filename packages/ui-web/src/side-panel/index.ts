/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry for @azes/ui-web/side-panel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { AzesSidePanel, type AzesSidePanelProps } from './AzesSidePanel';
export { AzesSidePanelHost } from './AzesSidePanelHost';
export {
  AzesSidePanelProvider,
  useSidePanel,
  useSidePanelState,
  type AzesSidePanelProviderProps,
} from './AzesSidePanelProvider';
export type { AzesSidePanelId, AzesSidePanelRegistry, AzesSidePanelWidth } from './registry';
export {
  DEFAULT_AZES_SIDE_PANEL_DISCARD_LABELS,
  DEFAULT_AZES_SIDE_PANEL_HOST_LABELS,
  type AzesSidePanelDiscardLabels,
  type AzesSidePanelHostLabels,
} from './types';
