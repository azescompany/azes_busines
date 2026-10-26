<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/02-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-16
║ Purpose: Package graph, subpath boundaries, injection contracts and enforcement
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Architecture

Living snapshot for agents: [CURRENT-STATE.md](CURRENT-STATE.md).

## Package graph

```text
@azes/design-tokens  (no React, no MUI)
   |            \
@azes/ui-web     @azes/ui-native (unchanged)
   |  core: theme, catalog, Box/Stack/Text/Button
   |  ├── /settings    -> core (+ compose feedback for AzesUiProvider)
   |  ├── /navigation  -> core
   |  ├── /layout      -> core, /navigation, /settings
   |  ├── /icons       -> core
   |  ├── /data-grid   -> core          (leaf, legacy)
   |  ├── /table       -> core          (leaf, default tables)
   |  ├── /charts      -> core          (leaf)
   |  ├── /forms       -> core          (leaf)
   |  ├── /feedback    -> core          (leaf; also used by settings)
   |  └── /locale      -> core          (leaf)
apps/*  -> @azes/ui-web (+ subpaths), @azes/permissions, @azes/i18n, ...
```

## Import rules

| From                                                                   | May import                           | Must not import                                                    |
| ---------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| core (`src/theme`, `src/components`, `src/catalog.ts`)                 | design-tokens, MUI, Emotion          | any `src/<subpath>/` folder                                        |
| `settings`                                                             | core, feedback (compose only)        | navigation, layout, forms, data-grid, charts, locale               |
| `navigation`                                                           | core                                 | settings, layout, forms, data-grid, charts                         |
| `layout`                                                               | core, navigation, settings           | forms, data-grid, charts                                           |
| `icons`, `forms`, `data-grid`, `table`, `charts`, `feedback`, `locale` | core                                 | every other subpath                                                |
| any ui-web file                                                        | MUI, MUI X, Emotion, react-hook-form | a router, `@azes/permissions`, api, state, auth, i18n              |
| apps                                                                   | `@azes/ui-web` and its subpaths      | `@mui/*`, `@emotion/*` (exceptions: ADR-009), `@azes/ui-web/src/*` |

## Public API

`packages/ui-web/package.json` `exports` has one entry per subpath:
`.`, `./settings`, `./settings/ssr`, `./navigation`, `./layout`, `./icons`, `./table`, `./data-grid`, `./charts`,
`./forms`, `./feedback`, `./locale`.
Each entry is a separate `dist/<name>/index.js`. Everything else is internal.

## Injection contracts

UI never knows about the router, permissions or translations. Apps adapt them:

```ts
type AzesRouterAdapter = {
  pathname: string;
  LinkComponent?: React.ElementType;
  navigate?: (to: string) => void;
};
type AzesAccessContext = {
  can(permission: string): boolean;
  hasRole(role: string): boolean;
  isEnabled(flag: string): boolean;
};
```

- Permissions: wrap `createPermissionChecker` from `@azes/permissions` (09).
- Router: pass the current pathname and a link component. `azes-ui` uses a hash adapter.
- i18n: pass already-translated strings to nav config and layouts.

## Ownership

| Concern                            | Owner                                      |
| ---------------------------------- | ------------------------------------------ |
| Raw values                         | `@azes/design-tokens`                      |
| Palette roles, variants, overrides | `@azes/ui-web` theme                       |
| Color scheme (light/dark/system)   | MUI `useColorScheme` (storage `azes-mode`) |
| Other UI preferences               | `@azes/ui-web/settings` store              |
| Navigation content                 | each app (config data)                     |
| Server data                        | TanStack Query in apps                     |

## Extension model

Apps extend by data and slots: nav config, layout `slots`, settings `defaults`/`locked`, theme
inputs. They never fork a platform component. A capability moves into `ui-web` only when it is
reusable UI with no business meaning.

## Enforcement

- ESLint `boundaries` (ui-web must not import api/state/auth) and `no-restricted-imports` (apps
  must not import `@mui/*` or `@emotion/*`; ui-web leaf subpaths must not import siblings).
- `pnpm architecture:verify` checks: `forbidden-libraries`, `ui-web-subpaths`,
  `layout-hardcoded-values`, `styles-docs`, plus the existing graph, deep import, header and
  bundle checks.
