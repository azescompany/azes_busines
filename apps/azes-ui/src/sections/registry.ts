/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/registry.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Showcase sections as AzesNavConfig data plus hash parsing helpers
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  IconAccessibility,
  IconAnalytics,
  IconComponents,
  IconDashboard,
  IconForm,
  IconInfo,
  IconLayout,
  IconLock,
  IconNavigation,
  IconPalette,
  IconSettings,
  IconTable,
} from '@azes/ui-web/icons';
import type { AzesNavConfig, AzesNavItem } from '@azes/ui-web/navigation';
import { createElement, type ComponentType } from 'react';

type Leaf = { id: string; label: string; caption?: string };
type Branch = { id: string; label: string; icon: ComponentType; children: readonly Leaf[] };

const leaf = ({ id, label, caption }: Leaf, icon?: ComponentType): AzesNavItem => ({
  id,
  title: label,
  caption,
  path: `/${id}`,
  icon: icon ? createElement(icon) : undefined,
});

const branch = ({ id, label, icon, children }: Branch): AzesNavItem => ({
  id,
  title: label,
  icon: createElement(icon),
  children: children.map((child) => leaf(child)),
});

const DESIGN_SYSTEM: readonly Branch[] = [
  {
    id: 'group-foundations',
    label: 'Foundations',
    icon: IconPalette,
    children: [
      { id: 'overview', label: 'Overview' },
      { id: 'colors', label: 'Colors' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'radius', label: 'Shape' },
      { id: 'shadows', label: 'Elevation' },
      { id: 'motion', label: 'Motion' },
    ],
  },
  {
    id: 'group-inputs',
    label: 'Inputs',
    icon: IconForm,
    children: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'inputs', label: 'Text fields' },
      { id: 'forms', label: 'Choice controls' },
    ],
  },
  {
    id: 'group-surfaces',
    label: 'Surfaces',
    icon: IconComponents,
    children: [
      { id: 'cards', label: 'Card' },
      { id: 'accordion', label: 'Accordion' },
    ],
  },
  {
    id: 'group-data-display',
    label: 'Data display',
    icon: IconTable,
    children: [
      { id: 'tables', label: 'Table' },
      { id: 'lists', label: 'List' },
      { id: 'avatars', label: 'Avatar and badge' },
      { id: 'tooltips', label: 'Tooltip' },
    ],
  },
  {
    id: 'group-feedback',
    label: 'Feedback',
    icon: IconInfo,
    children: [
      { id: 'alerts', label: 'Alert and progress' },
      { id: 'snackbar', label: 'Snackbar' },
      { id: 'dialogs', label: 'Dialog' },
    ],
  },
  {
    id: 'group-layout',
    label: 'Layout',
    icon: IconLayout,
    children: [
      { id: 'layout', label: 'Container, Grid, Stack' },
      { id: 'app-shell', label: 'App shell' },
      { id: 'responsive', label: 'Responsive' },
    ],
  },
  {
    id: 'group-navigation',
    label: 'Navigation',
    icon: IconNavigation,
    children: [
      { id: 'navigation', label: 'Tabs and pagination' },
      { id: 'breadcrumbs', label: 'Breadcrumbs' },
      { id: 'menus', label: 'Menus' },
    ],
  },
];

const PLATFORM: readonly [Leaf, ComponentType][] = [
  [{ id: 'platform-settings', label: 'Settings engine' }, IconSettings],
  [{ id: 'platform-navigation', label: 'Navigation engine' }, IconNavigation],
  [{ id: 'data-grid', label: 'Data grid', caption: 'MUI X community (legacy)' }, IconTable],
  [{ id: 'azes-table', label: 'AzesTable', caption: 'TanStack + MUI Table' }, IconTable],
  [{ id: 'charts', label: 'Charts', caption: 'MUI X community' }, IconAnalytics],
  [{ id: 'form-binding', label: 'Form binding' }, IconForm],
];

const PAGES: readonly [Leaf, ComponentType][] = [
  [{ id: 'pages-analytics', label: 'Analytics dashboard' }, IconDashboard],
  [{ id: 'pages-list', label: 'List page' }, IconTable],
  [{ id: 'pages-form', label: 'Form page' }, IconForm],
  [{ id: 'pages-auth', label: 'Auth page' }, IconLock],
  [{ id: 'accessibility', label: 'Focus and contrast' }, IconAccessibility],
];

export const SHOWCASE_NAV: AzesNavConfig = [
  { id: 'design-system', subheader: 'Design system', items: DESIGN_SYSTEM.map(branch) },
  {
    id: 'platform',
    subheader: 'Platform',
    items: PLATFORM.map(([item, icon]) => leaf(item, icon)),
  },
  { id: 'pages', subheader: 'Pages', items: PAGES.map(([item, icon]) => leaf(item, icon)) },
];

const LEAVES: readonly Leaf[] = [
  ...DESIGN_SYSTEM.flatMap((group) => group.children),
  ...PLATFORM.map(([item]) => item),
  ...PAGES.map(([item]) => item),
];

export const DEFAULT_SECTION_ID = 'overview';

export const ALL_SECTION_IDS: readonly string[] = LEAVES.map((item) => item.id);

/** English fallback label from the static registry (prefer i18n `sections.*.title`). */
export function findSectionLabel(id: string): string | undefined {
  return LEAVES.find((item) => item.id === id)?.label;
}

export function parseSectionHash(hash: string): string | null {
  const cleaned = hash.replace(/^#\/?/, '').trim();
  if (!cleaned) return null;
  const id = cleaned.split('/')[0] ?? cleaned;
  return ALL_SECTION_IDS.includes(id) ? id : null;
}
