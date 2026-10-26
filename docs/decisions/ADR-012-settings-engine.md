<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-012-settings-engine.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for the runtime settings engine and its persistence
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-012: Settings engine with an external store, not Redux

## Status

Accepted (2026-10-04). Supersedes the v1 decision "Theme Lab state stays in azes-ui".

## Context

UI preferences were split across four places: MUI mode storage, the `azes-primary` key,
in-memory Theme Lab state and the Redux `preferences.theme` slice.

## Options

1. Redux slice in `@azes/state` (ui-web may not import state; adds a store to every app).
2. React context holding the whole settings object (every change re-renders all consumers).
3. A small external store with `useSyncExternalStore` selectors, inside `@azes/ui-web/settings`.

## Decision

Option 3. `AzesSettings` (versioned) is persisted under `azes.settings.v1` in localStorage,
validated per field without zod, migrated from the legacy `azes-primary` key, synced across
tabs by the `storage` event. MUI keeps sole ownership of the color scheme. Apps can set
`defaults`, `locked` and `hiddenControls`.

## Consequences

- Components re-render only for the keys they select.
- Redux `preferences.theme` is deprecated (removal needs approval).
- `primary` is still mirrored to `azes-primary` so `AzesThemeProvider` apps and Next SSR agree.
