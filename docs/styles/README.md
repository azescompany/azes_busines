<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-11
║ Purpose: Index, reading order and glossary for the AZES web UI platform docs
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES web UI platform

The AZES web UI platform is `@azes/ui-web`: Material UI v9 configured and extended by AZES. It
holds the theme, layouts, navigation, runtime settings, forms, data grid, charts and icons for
every AZES web application. `@azes/ui-native` is out of scope.

## Cursor UI Design Agent

Attach [`.cursor/rules/uiDesignAgent.mdc`](../../.cursor/rules/uiDesignAgent.mdc). Start with
[CURRENT-STATE.md](CURRENT-STATE.md) (living snapshot + delta log), then the topic file for the
task. Always read `docs/ops/WORKER.md` first.

## Reading order

| You are...                 | Read                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| An app developer           | 00, 01, 08, 09, 10, 07, 14, 18                                                                  |
| A design-system maintainer | 01, 02, 03, 04, 05, 06, 07, 12, 15, 16, 19, 20                                                  |
| A Cursor agent             | CURRENT-STATE, uiDesignAgent rule, 01, 02, 20, then the topic file. `docs/ops/WORKER.md` first. |

## Files

| File                                                 | Topic                                           |
| ---------------------------------------------------- | ----------------------------------------------- |
| [CURRENT-STATE.md](CURRENT-STATE.md)                 | Living snapshot + delta log (UI Design Agent)   |
| [00-overview.md](00-overview.md)                     | What the platform is, quick start               |
| [01-principles.md](01-principles.md)                 | Rules, forbidden libraries, style hierarchy     |
| [02-architecture.md](02-architecture.md)             | Packages, subpaths, import rules, enforcement   |
| [03-design-tokens.md](03-design-tokens.md)           | Token layers and groups                         |
| [04-theme.md](04-theme.md)                           | Theme API, CSS variables, SSR, augmentation     |
| [05-color-system.md](05-color-system.md)             | Brand seeds, harmony, contrast                  |
| [06-typography.md](06-typography.md)                 | Variants and font presets                       |
| [07-components.md](07-components.md)                 | Taxonomy, wrapper criteria, icons               |
| [08-layout.md](08-layout.md)                         | Layout engine                                   |
| [09-navigation.md](09-navigation.md)                 | Navigation engine                               |
| [10-settings.md](10-settings.md)                     | Runtime settings and the settings drawer        |
| [11-responsive.md](11-responsive.md)                 | Breakpoints and responsive rules                |
| [12-accessibility.md](12-accessibility.md)           | Accessibility requirements and checks           |
| [13-mui-x.md](13-mui-x.md)                           | Legacy DataGrid, charts, date pickers, tree     |
| [14-forms.md](14-forms.md)                           | Forms with react-hook-form                      |
| [21-table.md](21-table.md)                           | AzesTable (TanStack + MUI Table) — default      |
| [22-accordion.md](22-accordion.md)                   | AzesAccordion search/CRUD panels                |
| [23-dialog.md](23-dialog.md)                         | Global AzesDialog promise queue                 |
| [24-carousel.md](24-carousel.md)                     | AzesCarousel (native scroll-snap gallery)       |
| [25-logo-and-loading.md](25-logo-and-loading.md)     | CaspianLogo / CaspianLoader (admin `@/loading`) |
| [29-skeleton.md](29-skeleton.md)                     | AzesSkeleton / Caspian-wave pending surfaces    |
| [30-login-hero.md](30-login-hero.md)                 | (superseded) → 31-login-shell                   |
| [31-login-shell.md](31-login-shell.md)               | Account Chrome & Canvas login shell             |
| [26-side-panel.md](26-side-panel.md)                 | Global AzesSidePanel (right drawer host)        |
| [27-menu.md](27-menu.md)                             | Global AzesMenu (trigger + items)               |
| [28-backdrop.md](28-backdrop.md)                     | Global glass MuiBackdrop (invisible rule)       |
| [15-testing.md](15-testing.md)                       | Automated tests and the visual QA matrix        |
| [16-performance.md](16-performance.md)               | Budgets and how they are measured               |
| [17-migration.md](17-migration.md)                   | UI platform phases, legacy summary, adoption    |
| [18-azes-ui.md](18-azes-ui.md)                       | The pilot and showcase app                      |
| [19-dependencies.md](19-dependencies.md)             | Dependency matrix and rules                     |
| [20-definition-of-done.md](20-definition-of-done.md) | Checklists for components, phases and releases  |
| [legacy/](legacy/README.md)                          | Frozen v1 docs (history only)                   |

Decisions: [ADR-009](../decisions/ADR-009-mui-web-theme.md) and ADR-010 to ADR-017 in
[`docs/decisions/`](../decisions/).

## Glossary

- **Brand seed.** One of 12 curated primary colors (`teal`, `navy`, ...). See 05.
- **Color scheme.** `light` or `dark`. **Mode** adds `system`. MUI `useColorScheme` owns it.
- **Density.** `comfortable` or `compact`. Changes control sizes, never typography.
- **Nav layout.** `vertical`, `mini` or `horizontal` desktop navigation. See 08 and 09.
- **Nav color.** `integrated` (nav matches the page) or `contrast` (dark nav surface).
- **Settings.** Persisted runtime UI preferences owned by `@azes/ui-web/settings`. See 10.
- **Subpath.** A public entry such as `@azes/ui-web/layout`. Each one is a separate bundle entry.
- **Slot.** A named place in a component where an app passes its own element (`slots.end`).
- **Access context.** The app-supplied object that answers permission, role and flag checks
  for navigation filtering.
- **Router adapter.** The app-supplied `pathname` and `LinkComponent` used by navigation.
