<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/17-migration.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: UI platform phases, gate template, legacy summary, coexistence and adoption rules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Migration

## Where we start

Styles track v1 (Phases 0–15, see [legacy/](legacy/README.md)) already moved every web app to
MUI 9 through `@azes/ui-web`. Cross-app verification (legacy `CROSS-APP.md`) showed all six web
apps pass on the shared theme. `BASELINE.md` (legacy) is the dated starting snapshot.

## Superseded v1 decisions

| v1 decision                                  | New decision                                         | Why                                                                                          |
| -------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| No AppShell in ui-web until two apps need it | Layouts in `@azes/ui-web/layout` (ADR-011)           | account, admin and agent-platform all need dashboards; building shells per app would diverge |
| Navigation is recipes, not components        | Navigation engine as data + renderers (ADR-011)      | Permissions filtering and active state must be identical everywhere                          |
| Theme Lab state stays in azes-ui             | Settings engine in `@azes/ui-web/settings` (ADR-012) | Products need the same persisted preferences                                                 |
| No curated icons barrel                      | `@azes/ui-web/icons` (ADR-015)                       | Apps cannot import `@mui/*`; icons need a public path                                        |
| Secondary color fixed (ADR-009 text)         | Derived from primary (v1 Phase 14)                   | Brand harmony; already shipped                                                               |

## UI platform phases (branch `styles`)

| Phase | Scope                                                                      | Status                  |
| ----- | -------------------------------------------------------------------------- | ----------------------- |
| 0     | Docs rebuild, ADR-010–016, references, `styles-docs` audit                 | COMPLETED               |
| 1     | Layout/component/font tokens; theme v2 inputs; `theme.azes`                | COMPLETED               |
| 2     | Settings engine                                                            | COMPLETED               |
| 3     | Navigation engine                                                          | COMPLETED               |
| 4     | Dashboard layout, header, vertical and mobile nav                          | COMPLETED               |
| 5     | Mini and horizontal nav, nav color, container                              | COMPLETED               |
| 6     | Settings drawer                                                            | COMPLETED               |
| 7–8   | Scheme/contrast QA, responsive and a11y pass, visual matrix, lazy sections | COMPLETED               |
| 9     | RTL (Emotion cache + `stylis-plugin-rtl`)                                  | BLOCKED: owner decision |
| 10–12 | Data grid, charts, forms                                                   | COMPLETED               |
| 13–14 | Dashboard, auth and main pages; full showcase; adoption guide              | COMPLETED               |

Detailed gate records are in `WORKER.md` ("UI Platform track").

## Gate template

Each phase records: entry criteria, files touched, deliverable, validation commands and
results, visual checklist rows, doc changes, rollback (`git revert` of the phase commits).

## Coexistence rules

- `AzesThemeProvider` keeps its props and behavior; product apps are not changed by this track.
- New capabilities are subpaths; nothing in the root export was removed.
- The legacy `azes-primary` key is still written, so apps on `AzesThemeProvider` and apps on
  `AzesUiProvider` agree on the primary color.
- `@azes/state` `preferences.theme` is deprecated (duplicate of the MUI mode). Removal is a
  Backlog item that needs approval.

## Adopting the platform in a product app

1. Replace `AzesThemeProvider` with `AzesUiProvider` inside `AppProviders`, passing `locked`
   values for anything the product does not let users change.
2. Define a nav config module; build `AzesAccessContext` from `createPermissionChecker`.
3. Add `AzesNavProvider` with the app's router adapter.
4. Wrap routes in `AzesDashboardLayout` (or main/auth layouts).
5. Add `AzesSettingsButton` + `AzesSettingsDrawer` only if users may customize.
6. Load data grid and charts lazily per route.
7. Run the app's smoke test and a visual pass. `admin` is the recommended first adopter; this is
   a separate approved track.

## RTL status

Blocked on the owner decision (are RTL locales planned?). Until then: logical CSS properties
everywhere, `direction` setting exists but its control is hidden, and the theme ships LTR.
Unblocking adds `@emotion/cache` + `stylis-plugin-rtl` and an `AzesRtlCache` inside
`AzesUiProvider` (ADR-015).
