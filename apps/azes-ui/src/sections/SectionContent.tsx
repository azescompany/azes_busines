/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/SectionContent.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Lazy section loaders keyed by section id; MUI X and pages load on demand
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { CircularProgress, MuiBox, Typography } from '@azes/ui-web';
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';

import { StackText } from './shared.js';

export type SectionProps = {
  onDialog: () => void;
  onSnack: () => void;
  onNavigate: (id: string) => void;
};

type LazySection = LazyExoticComponent<ComponentType<SectionProps>>;

function section<M>(
  load: () => Promise<M>,
  pick: (module: M) => ComponentType<SectionProps>,
): LazySection {
  return lazy(async () => ({ default: pick(await load()) }));
}

const foundations = () => import('./foundations.js');
const components = () => import('./components.js');
const layout = () => import('./layout.js');
const navigation = () => import('./navigation.js');
const platform = () => import('./platform.js');
const muiX = () => import('./mui-x.js');
const pages = () => import('../pages/pages.js');

const SECTIONS: Record<string, LazySection> = {
  overview: section(foundations, (m) => m.OverviewSection),
  colors: section(foundations, (m) => m.ColorsSection),
  typography: section(foundations, (m) => m.TypographySection),
  spacing: section(foundations, (m) => m.SpacingSection),
  radius: section(foundations, (m) => m.RadiusSection),
  shadows: section(foundations, (m) => m.ShadowsSection),
  motion: section(foundations, (m) => m.MotionSection),
  buttons: section(components, (m) => m.ButtonsSection),
  inputs: section(components, (m) => m.InputsSection),
  forms: section(components, (m) => m.FormsSection),
  cards: section(components, (m) => m.CardsSection),
  accordion: section(components, (m) => m.AccordionSection),
  tables: section(components, (m) => m.TablesSection),
  lists: section(components, (m) => m.ListsSection),
  avatars: section(components, (m) => m.AvatarsSection),
  tooltips: section(components, (m) => m.TooltipsSection),
  alerts: section(components, (m) => m.AlertsSection),
  snackbar: section(components, (m) => m.SnackbarSection),
  dialogs: section(components, (m) => m.DialogsSection),
  layout: section(layout, (m) => m.LayoutSection),
  'app-shell': section(layout, (m) => m.AppShellSection),
  responsive: section(layout, (m) => m.ResponsiveSection),
  navigation: section(navigation, (m) => m.NavigationSection),
  breadcrumbs: section(navigation, (m) => m.BreadcrumbsSection),
  menus: section(navigation, (m) => m.MenusSection),
  'platform-settings': section(platform, (m) => m.SettingsEngineSection),
  'platform-navigation': section(platform, (m) => m.NavigationEngineSection),
  'form-binding': section(platform, (m) => m.FormBindingSection),
  'data-grid': section(muiX, (m) => m.DataGridSection),
  'azes-table': section(muiX, (m) => m.AzesTableSection),
  charts: section(muiX, (m) => m.ChartsSection),
  'pages-analytics': section(pages, (m) => m.AnalyticsPage),
  'pages-list': section(pages, (m) => m.ListPage),
  'pages-form': section(pages, (m) => m.FormPage),
  accessibility: section(
    () => import('./accessibility.js'),
    (m) => m.AccessibilitySection,
  ),
};

function Loading() {
  return (
    <MuiBox sx={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
      <CircularProgress aria-label="Loading section" />
    </MuiBox>
  );
}

export function SectionContent({ id, ...props }: SectionProps & { id: string }) {
  const Section = SECTIONS[id];
  if (!Section) {
    return (
      <StackText>
        <Typography>Unknown section.</Typography>
      </StackText>
    );
  }
  return (
    <Suspense fallback={<Loading />}>
      <Section {...props} />
    </Suspense>
  );
}
