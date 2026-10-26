<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/state/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Overview of @azes/state client/global Redux foundation
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/state`

Redux Toolkit foundation for **client / global** state. Server/API cache stays in
`@azes/api` (TanStack Query).

## Public import

```ts
import {
  createAzesStore,
  AzesStoreProvider,
  useAppDispatch,
  useAppSelector,
  setTheme,
  selectThemePreference,
  loadPersistedPreferences,
  createWebStorageAdapter,
  MUST_NOT_ENTER_REDUX,
} from '@azes/state';
```

Do not deep-import package internals.

## Boundary

See `MUST_NOT_ENTER_REDUX` and `docs/architecture/state-architecture.md`.
