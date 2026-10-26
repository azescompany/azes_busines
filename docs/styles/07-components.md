<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/07-components.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Component taxonomy, wrapper criteria, catalog rules and icons
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Components

## Taxonomy

| Family       | Plain themed MUI (from the catalog)                                            | AZES components                                                                               |
| ------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Foundations  | Grid, Container, Divider, Typography                                           | Box, Stack, Text                                                                              |
| Navigation   | Tabs, Breadcrumbs, Pagination, Menu                                            | `AzesNavList`, `AzesNavMiniList`, `AzesNavHorizontalBar` (09)                                 |
| Inputs       | TextField, Select, Autocomplete, Checkbox, Radio, Switch, Slider, ToggleButton | Button                                                                                        |
| Surfaces     | Paper, Card, CardContent, Accordion, AppBar                                    | —                                                                                             |
| Data display | Table*, List*, Avatar, Badge, Chip, Tooltip                                    | —                                                                                             |
| Feedback     | Alert, Snackbar, Progress, Skeleton, Backdrop                                  | —                                                                                             |
| Overlays     | Dialog, Drawer, Popover, Menu                                                  | —                                                                                             |
| Forms        | FormControl, FormHelperText                                                    | `AzesForm`, `AzesFormTextField`, `AzesFormSection`, `AzesFormActions` (14)                    |
| Charts       | —                                                                              | `AzesLineChart`, `AzesBarChart`, `AzesPieChart` (13)                                          |
| Data table   | —                                                                              | `AzesTable` (21); legacy `AzesDataGrid` (13)                                                  |
| Layout       | —                                                                              | layouts, header, navs, `AzesMainContent` (08)                                                 |
| Settings     | —                                                                              | `AzesSettingsDrawer`, `AzesSettingsButton`, `AzesSettingsSection`, `AzesSettingsControl` (10) |
| Utilities    | SvgIcon, Fade, Collapse                                                        | icons subpath, `createAzesIcon`                                                               |

## When to create an AZES component

Create one only if at least one is true:

1. It owns reusable behavior or state (navigation filtering, settings, form binding).
2. It composes several MUI parts with consistent slots (layouts, header).
3. It carries an accessibility contract the theme cannot express (nav landmarks, form errors).
4. It hides a replaceable dependency (MUI X).

Otherwise use a theme override, `defaultProps` or a variant. A wrapper that only renames a MUI
component is rejected.

## Catalog rules

- `packages/ui-web/src/catalog.ts` re-exports MUI components by name. No `export *`.
- Add a component to the catalog when an app or the showcase needs it, and add its override
  group test at the same time.
- Skipped on purpose: Filled/standard inputs, SpeedDial, Pigment CSS, `@mui/lab`.

## Icons (`@azes/ui-web/icons`)

- Curated named exports with semantic names (`IconDashboard`, `IconSettings`, ...), each
  re-exported from a path import of `@mui/icons-material` so bundlers keep only used icons.
- `createAzesIcon(path, displayName)` builds custom AZES icons with `createSvgIcon`.
- Apps import icons only from this subpath. Add a new icon by adding one export line.
- `azes-ui` may still import `@mui/icons-material/<Name>` paths for demos (ADR-009).

## Animation

MUI transitions only (`Fade`, `Collapse`, `Grow`, `Slide`) with theme durations. All respect
`prefers-reduced-motion` through the `CssBaseline` rule.

## Adding a component (template)

1. Check the hierarchy in 01: theme first.
2. If a component is justified, add it under its subpath folder with a test and a showcase demo.
3. Export it from the subpath `index.ts` only.
4. Document it in the family's doc file and tick 20.
