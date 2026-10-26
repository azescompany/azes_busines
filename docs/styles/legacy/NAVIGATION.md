<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/NAVIGATION.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: AppBar and Drawer patterns and their theme support
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Navigation

Navigation patterns are **recipes built from MUI `AppBar`, `Toolbar` and `Drawer`**. The theme
styles those components. The showcase shows each recipe. No `AzesAppBar` or `AzesSidebar`
components are added.

## AppBar

| Mode        | MUI setup                                                                                  | Use                                          |
| ----------- | ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| static      | `position="static"`                                                                        | Simple pages, settings                       |
| sticky      | `position="sticky"`                                                                        | Long content pages (default recommendation)  |
| fixed       | `position="fixed"` plus a `<Toolbar />` spacer in main                                     | Dashboards with a permanent drawer           |
| transparent | `position="fixed" color="transparent" elevation={0}`, then elevate with `useScrollTrigger` | Marketing / landing (agent-site, realestate) |

Theme support (Phase 6):

- `MuiAppBar.defaultProps`: `color="default"`, `elevation={0}`.
- `styleOverrides.root`: bottom border `theme.vars.palette.divider`, background
  `background.paper`.
- `zIndex.appBar` (sticky token) is already mapped. A fixed AppBar over a permanent drawer uses
  `zIndex.drawer + 1`, as the showcase does today.
- `MuiToolbar`: dense when density is `compact`.

## Drawer (sidebar)

| Mode        | MUI setup                                                                             | Breakpoint rule                              |
| ----------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| permanent   | `variant="permanent"`, fixed width                                                    | `lg` and up                                  |
| collapsible | `variant="permanent"`, width animates between full and closed via `theme.transitions` | `md` and up                                  |
| mini        | Collapsible with a closed width that shows icons only (56px)                          | `md` and up                                  |
| temporary   | `variant="temporary"` with `ModalProps={{ keepMounted: true }}`                       | below `lg` (or below `md` when mini is used) |

- Widths: full 260px, mini 56px. These are documented constants in the recipe and do not become
  tokens unless two apps use them.
- Mini mode needs `ListItemIcon` on every item and a `Tooltip` with the label when collapsed.
- Selected item: `ListItemButton selected`, styled by the List override (P9) with a `color-mix`
  of primary.
- The open/closed state belongs to the app. In the showcase it is Theme Lab demo state. In
  products it may be a persisted UI preference in `@azes/state` (client state, per the
  state-management rules). It never goes into `ui-web`.

## Other navigation

- Tabs: in-page sections. Breadcrumbs: hierarchy deeper than two levels. Pagination: lists and
  tables. All in Phases 6 and 9.
- Routing integration (for example `ListItemButton component={RouterLink}`) stays in apps.
  `ui-web` must not import a router.

## Accessibility

- Landmarks: `AppBar component="header"`, Drawer content inside `<nav aria-label>`,
  `main` for content.
- The temporary drawer returns focus to its trigger on close (MUI default). Keep it.
- Mini drawer items keep an accessible name when the label is hidden (`aria-label`).
