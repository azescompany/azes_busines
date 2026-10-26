<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/16-performance.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Performance budgets for the UI platform and how they are measured
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Performance

## Budgets

| Concern                    | Budget                                                         | Measured by                                            |
| -------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| Theme build                | < 8 ms median per `createAzesTheme` call                       | `createAzesTheme.test.ts` timing guard (median of 20)  |
| Scheme switch              | no theme rebuild                                               | CSS variables; provider test                           |
| Settings change re-renders | only components that select the changed key                    | settings `Profiler` test                               |
| Provider depth             | ≤ 3 AZES providers (settings, theme, nav)                      | review                                                 |
| Navigation                 | filter runs once per `[config, access]`                        | `useFilteredNav` memo test                             |
| ui-web `dist` size         | soft ceiling in `bundle-sanity` (raised once for new subpaths) | `pnpm architecture:verify`                             |
| MUI X                      | not in the azes-ui entry chunk                                 | Vite build output: grid/chart code only in lazy chunks |
| Icons                      | path imports only (`@mui/icons-material/Name`)                 | ESLint `no-restricted-imports`                         |

## Rules

- Never create a theme inside render. Providers memoize on their inputs.
- Read settings with selectors; never pass the whole settings object down.
- Keep nav config and data grid `columns` as module constants or memoized values.
- `sx` objects in hot lists (nav items, table rows) are static constants or move into
  `styled`/overrides; inline `sx` is fine elsewhere.
- Large client modules (showcase sections, MUI X) load with `React.lazy`.
- One copy of each state: mode in MUI, preferences in settings, server data in TanStack Query.
