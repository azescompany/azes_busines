<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/10-settings.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-11
║ Purpose: Runtime settings model, store, persistence, SSR hydration and drawer components
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Settings

Runtime customization is a platform capability in `@azes/ui-web/settings` (ADR-012).

## Model

```ts
type AzesSettings = {
  version: 1;
  primary: string; // brand seed name or contrast-safe hex
  navLayout: 'vertical' | 'mini' | 'horizontal';
  navColor: 'integrated' | 'contrast';
  density: 'comfortable' | 'compact';
  direction: 'ltr' | 'rtl';
  fontFamily: 'default' | 'system' | 'inter';
  container: 'fluid' | 'fixed';
};
```

Changes from the first proposal and why:

- **No `colorScheme` field.** MUI `useColorScheme` already owns mode, storage (`azes-mode`) and
  the pre-paint script. A second copy would drift. The drawer's mode control calls
  `useColorScheme().setMode`.
- **`density` enum** instead of `compactLayout: boolean`, matching the theme input.
- **Font presets** instead of a free string (06).
- **`version`** so stored data can be migrated.

Defaults: `DEFAULT_AZES_SETTINGS` = teal, horizontal, integrated, comfortable, ltr, `inter`,
fluid, headerMode `autoHide`. Font options: five distinct presets (`inter` … `fraunces`); see 06.

## Store and hooks

- `createAzesSettingsStore(options)` returns `{ getState, subscribe, set, reset }`, a small
  external store with a reducer (`set`, `reset`, `hydrate`).
- `useAzesSettings(selector)` uses `useSyncExternalStore`. A component re-renders only when
  its selected value changes: `useAzesSettings((s) => s.navLayout)`.
- `useAzesSettingsActions()` returns `{ set, reset }` and never causes a re-render.
- No Redux. These are UI preferences local to the platform. The Redux `preferences.theme`
  slice is deprecated (17).

## Provider

```ts
type AzesSettingsProviderProps = {
  defaults?: Partial<AzesSettings>; // app defaults merged over DEFAULT_AZES_SETTINGS
  locked?: Partial<AzesSettings>; // always win; their controls are hidden
  hiddenControls?: readonly AzesSettingsKey[]; // default ['direction'] until RTL is approved
  storage?: 'local' | 'none'; // default 'local'
  storageKey?: string; // default 'azes.settings.v1'
  initialSettings?: Partial<AzesSettings>; // SSR: values read from the cookie on the server
  children: ReactNode;
};
```

`AzesUiProvider` = `AzesSettingsProvider` + `AzesThemeProvider` wired to the store. It accepts
the same props.

## Persistence

- Key `azes.settings.v1` in `localStorage`. Writes also mirror:
  - full settings JSON → cookie `azes-settings` (cross-port account ↔ admin)
  - `primary` → `azes-primary` (cookie + storage)
  - color mode → cookie `azes-mode` via `createAzesCrossPortStorageManager` on
    `AzesThemeProvider` (MUI `storageManager`)
- Why cookies: `localStorage` is **origin-scoped including port** (`:5173` ≠ `:5174`).
  Cookies on the same host are shared across ports, so logout/refresh handoff keeps dark
  mode + primary in sync. Optional `configureAzesPrefsCookie({ domain })` mirrors
  `VITE_AUTH_COOKIE_DOMAIN` for subdomain prod.
- `parseAzesSettings(raw)` validates each field on its own. A bad field falls back to its
  default; the rest is kept. Invalid JSON gives defaults. No zod dependency.
- `migrateAzesSettings(raw)` upgrades older versions. With no stored settings, it reads the
  legacy `azes-primary` key / cookie once.
- Cross-tab sync: the store listens to the `storage` event for its key and re-hydrates.
- SSR: `realestate` can read the cookie and pass `initialSettings`; storage is read only in the
  browser.

## Drawer components

| Component             | Role                                                                |
| --------------------- | ------------------------------------------------------------------- |
| `AzesSettingsButton`  | Header icon button; `aria-label`, `aria-expanded`, opens the drawer |
| `AzesSettingsDrawer`  | Right-side temporary drawer; applies changes live; reset button     |
| `AzesSettingsSection` | Titled group (`role="group"`, `aria-labelledby`)                    |
| `AzesSettingsControl` | Option cards (single choice, `ToggleButtonGroup`) or swatches       |

Sections: Mode, Primary color, Navigation layout, Navigation color, Density, Font, Container,
Direction (hidden by default). Controls for `locked` or hidden keys are not rendered.
