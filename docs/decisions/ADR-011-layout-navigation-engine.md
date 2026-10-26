<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-011-layout-navigation-engine.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for the layout and navigation engine in ui-web
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-011: Layout and navigation engine in ui-web, with injected router and access

## Status

Accepted (2026-10-04). Supersedes the v1 decisions "no AppShell in ui-web" and "navigation is
recipes, not components" (`docs/styles/legacy/LAYOUT.md`, `NAVIGATION.md`).

## Context

account, admin and agent-platform will all be dashboards. Building shells per app would give
diverging headers, nav behavior and permission handling. UI packages must not import a router,
permissions or i18n.

## Options

1. Keep recipes; each app builds its shell.
2. Put layouts in each app and share nothing.
3. Ship layouts and a navigation engine in ui-web, with router and access passed in.

## Decision

Option 3. Navigation is data (`AzesNavConfig`) with pure `filterNav` and
`resolveActiveTrail`. Apps pass `AzesRouterAdapter` and `AzesAccessContext` through
`AzesNavProvider`. Layout dimensions come from `layoutPx` tokens.

## Consequences

- One tested implementation of nav filtering, active state, mobile nav and mini nav.
- `ui-web` stays free of router, permissions and i18n dependencies.
- Apps must keep nav config stable (module constants) for memoization.
