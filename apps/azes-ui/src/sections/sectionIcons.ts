/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/sectionIcons.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Section id → icon for phase value cards / sticky nav
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  IconAccessibility,
  IconAnalytics,
  IconApps,
  IconComponents,
  IconDashboard,
  IconDocument,
  IconForm,
  IconInfo,
  IconLayout,
  IconList,
  IconNavigation,
  IconPalette,
  IconSettings,
  IconTable,
} from '@azes/ui-web/icons';
import type { ComponentType } from 'react';

type SectionIcon = ComponentType<{ fontSize?: 'inherit' | 'large' | 'medium' | 'small' }>;

const MAP: Record<string, SectionIcon> = {
  overview: IconApps as SectionIcon,
  colors: IconPalette as SectionIcon,
  typography: IconDocument as SectionIcon,
  spacing: IconLayout as SectionIcon,
  radius: IconComponents as SectionIcon,
  shadows: IconDashboard as SectionIcon,
  motion: IconAnalytics as SectionIcon,
  buttons: IconForm as SectionIcon,
  inputs: IconForm as SectionIcon,
  forms: IconForm as SectionIcon,
  cards: IconComponents as SectionIcon,
  accordion: IconList as SectionIcon,
  tables: IconTable as SectionIcon,
  lists: IconList as SectionIcon,
  avatars: IconApps as SectionIcon,
  tooltips: IconInfo as SectionIcon,
  alerts: IconInfo as SectionIcon,
  snackbar: IconInfo as SectionIcon,
  dialogs: IconDocument as SectionIcon,
  layout: IconLayout as SectionIcon,
  'app-shell': IconDashboard as SectionIcon,
  responsive: IconApps as SectionIcon,
  navigation: IconNavigation as SectionIcon,
  breadcrumbs: IconNavigation as SectionIcon,
  menus: IconList as SectionIcon,
  'platform-settings': IconSettings as SectionIcon,
  'platform-navigation': IconNavigation as SectionIcon,
  'form-binding': IconForm as SectionIcon,
  'data-grid': IconTable as SectionIcon,
  'azes-table': IconTable as SectionIcon,
  charts: IconAnalytics as SectionIcon,
  'pages-analytics': IconAnalytics as SectionIcon,
  'pages-list': IconList as SectionIcon,
  'pages-form': IconForm as SectionIcon,
  accessibility: IconAccessibility as SectionIcon,
};

export function sectionIcon(id: string): SectionIcon {
  return MAP[id] ?? (IconComponents as SectionIcon);
}
