<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/SHOWCASE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-04
║ Purpose: apps/azes-ui information architecture and Theme Lab design
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Showcase (`apps/azes-ui`)

A Vite app on port 5177 (`pnpm --filter @azes/azes-ui dev`). It is private, never deployed as a
product, and never a dependency of another app.

## Structure (Phase 12)

```text
apps/azes-ui/src/
  app/App.tsx                 ThemeLabProvider + AzesThemeProvider bridge
  lab/ThemeLabContext.tsx     demo-only state (React context, not Redux)
  lab/ThemeLabPanel.tsx       side panel + Copy config
  lab/themeLabTypes.ts        AppBar/sidebar/viewport types
  shell/ShowcaseShell.tsx     AppBar + Drawer + main + dialogs
  sections/
    registry.ts               NAV groups, hash parse, section ids
    SectionContent.tsx        id → section component map
    foundations.tsx           Overview, Colors, Typography, Spacing, Shape, Elevation, Motion
    components.tsx            Inputs, surfaces, data display, feedback
    layout.tsx                Container/Grid/Stack, app shell, responsive
    navigation.tsx            AppBar/Drawer modes, breadcrumbs, menus
    accessibility.tsx         Focus / contrast demos
    shared.tsx                SectionIntro helpers
  showcase/Showcase.tsx       thin entry → ShowcaseShell
```

- Hash routes: `#/overview`, `#/buttons`, … (no router dependency).
- Theme Lab state stays in `apps/azes-ui`. Only `primary` / `density` reach
  `AzesThemeProvider` (secondary / focus / link auto-harmonize in ui-web).

## Sections

| Group         | Sections                                                        |
| ------------- | --------------------------------------------------------------- |
| Foundations   | Overview, Colors, Typography, Spacing, Shape, Elevation, Motion |
| Inputs        | Buttons, Text fields, Choice controls                           |
| Surfaces      | Card, Accordion                                                 |
| Data display  | Table, List, Avatar and badge, Tooltip                          |
| Feedback      | Alert and progress, Snackbar, Dialog                            |
| Layout        | Container/Grid/Stack, App shell recipe, Responsive              |
| Navigation    | App bar and sidebars, Breadcrumbs, Menus                        |
| Accessibility | Focus and contrast                                              |

## Theme Lab

| Control   | Values                                       | Applies to             |
| --------- | -------------------------------------------- | ---------------------- |
| Mode      | light / dark / system                        | `useColorScheme`       |
| Primary   | 12 seed swatches + custom hex                | theme input, persisted |
| Secondary | auto from primary (read-only preview)        | ui-web harmony         |
| Density   | comfortable / compact                        | theme input            |
| Nav mode  | static / sticky / fixed / transparent AppBar | shell props            |
| Sidebar   | permanent / collapsible / mini / temporary   | shell props            |
| Viewport  | Fluid / 360 / 768 / 1024 / 1440              | preview frame width    |

Copy config outputs the current `AzesThemeProvider` props JSON.

## Tests

- Shell, layout, viewport, skip link / dialog / accessibility smoke tests.
- Registry smoke: every section id renders its heading without throwing.

## Known limitations

- Section modules are eagerly imported (bundle ~693 kB). Lazy `React.lazy` per section is a
  future candidate if the showcase grows further.
- Patterns pages (form page, list+detail, settings) are not separate routes yet; app-shell recipe
  covers the shell pattern.
- Manual axe / 200% zoom checklist remains in [ACCESSIBILITY.md](ACCESSIBILITY.md) (`axe-core`
  not added).
