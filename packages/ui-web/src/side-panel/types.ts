/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/side-panel/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Internal registration + API types for AzesSidePanel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';

import type { AzesSidePanelId, AzesSidePanelWidth } from './registry';

export type AzesSidePanelDiscardLabels = {
  title: string;
  description: string;
  confirm: string;
  cancel: string;
};

export type AzesSidePanelHostLabels = {
  close: string;
};

export const DEFAULT_AZES_SIDE_PANEL_DISCARD_LABELS: AzesSidePanelDiscardLabels = {
  title: 'Discard changes?',
  description: 'You have unsaved changes. Leave without saving?',
  confirm: 'Discard',
  cancel: 'Keep editing',
};

export const DEFAULT_AZES_SIDE_PANEL_HOST_LABELS: AzesSidePanelHostLabels = {
  close: 'Close',
};

export type AzesSidePanelRegistration = {
  id: AzesSidePanelId;
  title: ReactNode;
  subtitle?: ReactNode;
  width: AzesSidePanelWidth;
  isDirty: boolean;
  onCloseRequest?: () => void;
};

export type AzesSidePanelCloseOptions = {
  /** Skip dirty-guard confirm (e.g. after Apply saved the draft). */
  discard?: boolean;
};

export type AzesSidePanelApi = {
  activeId: AzesSidePanelId | null;
  open: (id: AzesSidePanelId) => Promise<void>;
  close: (options?: AzesSidePanelCloseOptions) => Promise<void>;
  closeAll: (options?: AzesSidePanelCloseOptions) => Promise<void>;
  toggle: (id: AzesSidePanelId) => Promise<void>;
  register: (registration: AzesSidePanelRegistration) => void;
  unregister: (id: AzesSidePanelId) => void;
  getRegistration: (id: AzesSidePanelId) => AzesSidePanelRegistration | undefined;
};
