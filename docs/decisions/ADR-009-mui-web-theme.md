<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-009-mui-web-theme.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-10-04
║ Purpose: Decision record for Material UI v9 as the web theme engine
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-009: Material UI v9 is the web theme engine inside ui-web

## Status

Accepted. Supersedes the web styling sentence in
[ADR-004](ADR-004-ui-architecture.md) that described the web layer as Radix-style CSS.
ADR-004 still stands for the split between `@azes/ui-web` and `@azes/ui-native`.

Cross-app verification (Styles Phase 13) is recorded in
[docs/styles/legacy/CROSS-APP.md](../styles/legacy/CROSS-APP.md).

Superseded in part by ADR-010 to ADR-016 (UI platform track, 2026-10-04): layouts, navigation,
settings, icons, MUI X and forms are now part of `@azes/ui-web` as subpaths. Decision 6 below is
also outdated: secondary, focus and link now derive from primary (v1 Styles Phase 14).

## Context

Phases 0–12 shipped a token package and a four-component web shell (`Box`, `Stack`, `Text`,
`Button`) styled with one BEM stylesheet and `--azes-*` variables. Product work now needs
light, dark, and system mode, a runtime primary color, accessible contrast, and the usual
application surfaces (inputs, dialogs, navigation, tables) on both Vite and Next.js App
Router.

The repository had no `@mui/*` dependency. Web runtime is React 19.1 and Next.js 15.4.
Material UI v9.3 (`@mui/material`) declares peers for React 17–19 and still styles with
Emotion. `@mui/material-nextjs` 9.4 provides `AppRouterCacheProvider` from
`@mui/material-nextjs/v15-appRouter`.

## Decision

1. `@azes/design-tokens` stays React-free and remains the source for spacing, type, radius,
   shadow, breakpoints, z-index, motion, and semantic color. Native keeps consuming it.
2. `@azes/ui-web` owns `createAzesTheme` and `AzesThemeProvider`. It depends on
   `@mui/material`, `@emotion/react`, and `@emotion/styled`. No new `theme` or `ui` package.
3. Apps do not import `@mui/material` components. Exceptions:
   - `apps/realestate` may import `@mui/material-nextjs` and
     `@mui/material/InitColorSchemeScript` (official SSR and color-scheme script).
   - `apps/azes-ui` may import `@mui/icons-material/<Icon>` (deep imports only).
4. `@mui/material-nextjs` is a dependency of Next apps, not of `@azes/ui-web`, because it
   peers on `next`.
5. One theme object holds both `colorSchemes`. Mode switches do not call `createTheme`.
   Only a primary seed change rebuilds the theme.
6. Default primary is the existing brand `color.teal600` (`#167764`). Secondary (navy) and
   feedback colors stay stable when primary changes, matching
   `packages/design-tokens/src/semantic/color.ts`.
7. `@azes/ui-native` is unchanged. MUI is web-only.
8. CSS variables use the default `--mui` prefix so they do not collide with legacy `--azes-*`
   during migration.

## Consequences

- ADR-004’s “apps never import the primitive library” rule remains. The web primitive is now
  MUI, hidden inside `@azes/ui-web`.
- Emotion stays until a future MUI major removes it. Pigment CSS and MUI X are out of scope.
- `docs/styles/` is the usage record ([index](../styles/README.md)); the v1 migration record is
  in `docs/styles/legacy/`.
