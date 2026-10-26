<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/README.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-10-02
║ Purpose: Index for the web design-system and MUI theme docs
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Styles

These docs cover the AZES web design system, built on Material UI 9.3.1 inside `@azes/ui-web`.
Native styling stays in `@azes/ui-native` and is not covered here.

The living showcase is `apps/azes-ui` (`pnpm --filter @azes/azes-ui dev`) — see
[SHOWCASE.md](SHOWCASE.md). Styles Phases 0–15 are complete on the `styles` branch; see
[CROSS-APP.md](CROSS-APP.md) for product-app verification.

Decision record: [ADR-009](../decisions/ADR-009-mui-web-theme.md). Work happens on the `styles`
branch, one approved phase at a time (see [ROADMAP.md](ROADMAP.md)).

## Read in this order

| Doc                                  | Covers                                                 |
| ------------------------------------ | ------------------------------------------------------ |
| [VISION.md](VISION.md)               | What the design system is for, and what it is not      |
| [BASELINE.md](BASELINE.md)           | Validation state and version notes before the roadmap  |
| [ARCHITECTURE.md](ARCHITECTURE.md)   | Packages, data flow, token ownership                   |
| [THEME.md](THEME.md)                 | `createAzesTheme` options, file layout, provider       |
| [COLOR.md](COLOR.md)                 | Brand seeds, dynamic primary and secondary, light/dark |
| [TYPOGRAPHY.md](TYPOGRAPHY.md)       | Variants and how they map to tokens                    |
| [LAYOUT.md](LAYOUT.md)               | Spacing, density presets, containers, grid             |
| [COMPONENTS.md](COMPONENTS.md)       | MUI component inventory and customization rules        |
| [NAVIGATION.md](NAVIGATION.md)       | AppBar and Drawer patterns                             |
| [RESPONSIVE.md](RESPONSIVE.md)       | Breakpoints and adaptive rules                         |
| [ACCESSIBILITY.md](ACCESSIBILITY.md) | Focus, contrast, motion, testing                       |
| [SHOWCASE.md](SHOWCASE.md)           | `apps/azes-ui` information architecture and Theme Lab  |
| [CROSS-APP.md](CROSS-APP.md)         | Product web-app theme integration verification         |
| [ROADMAP.md](ROADMAP.md)             | Phases 0 to 13 and the list of things not to build     |

## History

[migration/](migration/) holds the record of the BEM-to-MUI migration (files 00 to 13). It
describes how the current state was reached. Do not extend it; new decisions go into the topic
docs above.
