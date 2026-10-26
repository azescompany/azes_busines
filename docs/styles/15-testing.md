<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/15-testing.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Automated test layers, architecture checks and the visual QA matrix
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Testing

Existing tooling only: Vitest + Testing Library + jsdom for unit and component tests,
Playwright for browser tests. No new test framework.

## Automated layers

| Layer         | Where                                                        | Covers                                                                                                                                                    |
| ------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit          | `packages/design-tokens`, `packages/ui-web/src/**/*.test.ts` | tokens, theme output, contrast, settings parse/migrate/reducer, nav filter/active/depth                                                                   |
| Component     | `packages/ui-web/src/**/*.test.tsx`                          | settings re-render scope, drawer live apply, layouts per breakpoint (`matchMedia` mock), nav renderers keyboard, forms errors, data grid and chart render |
| Integration   | `apps/azes-ui/src/**/*.test.tsx`                             | every showcase section renders; settings drawer changes the shell; persistence across remount                                                             |
| Architecture  | `pnpm architecture:verify`                                   | dependency direction, forbidden libraries, ui-web subpath boundaries, no hard-coded layout px, docs set present, legacy folder frozen                     |
| Browser smoke | `e2e/smoke/*.spec.ts`                                        | every web app boots (CI matrix)                                                                                                                           |
| Visual        | `e2e/visual/azes-ui.spec.ts` (project `azes-ui-visual`)      | screenshot matrix below                                                                                                                                   |

Specific behaviors that must have tests: theme switching, settings persistence including
schema migration and corrupted storage, cross-tab sync, navigation filtering by permissions,
roles and flags, responsive layout switch at `layoutQuery`, data grid render, form validation.

## Visual QA matrix (azes-ui)

Captured with Playwright `toHaveScreenshot` against `vite preview` on port 5177.

| Axis       | Values                                    |
| ---------- | ----------------------------------------- |
| Scheme     | light, dark                               |
| Viewport   | 360×800, 768×1024, 1440×900               |
| Nav layout | vertical, mini, horizontal (desktop only) |
| Density    | comfortable, compact (spot check)         |
| Primary    | teal, violet, red (spot check)            |

Behavior checks in the same project (no screenshot): live settings change, persistence after
reload, no first-paint scheme flash (the `data-azes-color-scheme` attribute is correct before
`#root` renders), no console errors.

States reviewed in the showcase: overflow, scrolling, focus, hover, selected, empty, loading,
error, skeleton, dialogs, drawers, menus, tooltips, tables, charts.

**Pass:** screenshot diff ≤ 0.1% (`maxDiffPixelRatio: 0.001`), no console errors, behavior
checks pass. Animations are disabled and fonts fixed for stable shots.

Baselines are platform-specific (Playwright suffixes them by OS). The visual project is run
locally (`pnpm --filter @azes/azes-ui test:visual`) and is not part of the CI matrix until a
Linux baseline is recorded.

## Gate commands

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm architecture:verify
```
