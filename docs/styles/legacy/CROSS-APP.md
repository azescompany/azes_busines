<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/CROSS-APP.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Cross-app verification record for the AZES MUI theme (Styles Phase 13)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Cross-app verification

Styles Phase 13 record. Proves that `@azes/ui-web` (MUI 9.3.1) serves every web app, not only
`apps/azes-ui`.

## Applications verified

| App              | Framework             | UI package     | Theme provider                       | MUI                                                  | Emotion              | Status                       |
| ---------------- | --------------------- | -------------- | ------------------------------------ | ---------------------------------------------------- | -------------------- | ---------------------------- |
| `account`        | Vite SPA              | `@azes/ui-web` | `AzesThemeProvider`                  | via ui-web                                           | via ui-web           | PASS                         |
| `admin`          | Vite SPA              | `@azes/ui-web` | `AzesThemeProvider`                  | via ui-web                                           | via ui-web           | PASS                         |
| `agent-platform` | Vite SPA              | `@azes/ui-web` | `AzesThemeProvider`                  | via ui-web                                           | via ui-web           | PASS                         |
| `agent-site`     | Vite SPA              | `@azes/ui-web` | `AzesThemeProvider`                  | via ui-web                                           | via ui-web           | PASS                         |
| `realestate`     | Next.js 15 App Router | `@azes/ui-web` | `AzesThemeProvider` + cookie primary | `@mui/material` 9.3.1 + `@mui/material-nextjs` 9.4.0 | direct peers for SSR | PASS                         |
| `azes-ui`        | Vite showcase         | `@azes/ui-web` | Theme Lab → `AzesThemeProvider`      | catalog + icons (deep)                               | via ui-web           | PASS (Phase 12 + regression) |

Mobile apps use `@azes/ui-native` and were not modified.

## Theme integration

```text
createAzesTheme / AzesThemeProvider  (@azes/ui-web)
        │
        ├── Vite apps: AppProviders → AzesThemeProvider (system defaultMode)
        ├── realestate: InitColorSchemeScript + AppRouterCacheProvider + cookie primary
        └── azes-ui: ThemeLabProvider drives primary / density / scheme UI
```

- One theme factory; no competing palettes or typography definitions in product apps.
- Vite apps do not import `@mui/*` or `@emotion/*` (ESLint `azes/no-mui-in-product-apps`).
- `realestate` uses only the documented SSR exceptions (`InitColorSchemeScript`,
  `AppRouterCacheProvider`) plus Emotion peers required by that stack.
- CSS entry points are height resets only (`styles.css` / `globals.css`); color and type come
  from `CssBaseline`.

## Runtime checks

| Check                        | account (Vite preview)    | realestate (Next start)            |
| ---------------------------- | ------------------------- | ---------------------------------- |
| Boot / shell text            | PASS                      | PASS                               |
| `--mui-palette-primary-main` | `#167764`                 | `#167764`                          |
| `data-azes-color-scheme`     | light / dark via storage  | light; init script present in HTML |
| Dark mode surfaces           | PASS (`rgb(15,28,44)` bg) | system + InitColorSchemeScript     |
| Mobile 360 overflow          | none                      | not re-emulated (shell identical)  |

## Findings

### Design-system

- None blocking. Shared theme, catalog exports, and CssBaseline behave consistently.

### Application

- Product Home shells use `Box` / `Stack` / `Text` only — sufficient for foundation proof; not a
  full MUI surface demos (those live in `azes-ui`).
- Product apps do not ship Theme Lab, density toggles, or skip-to-content (showcase-only by
  design).

### Pre-existing / intentional

- `@mui/material-nextjs` is 9.4.0 while `@mui/material` is 9.3.1 (documented in BASELINE.md).
- `azes-ui` production chunk ~693 kB (eager sections); lazy-load is a future candidate.
- `architecture:verify` banner still says “Phase 12” — cosmetic script label only.

## Hard-coded style audit

| Finding                                                   | Class | Notes                      |
| --------------------------------------------------------- | ----- | -------------------------- |
| Height-reset CSS in each web app                          | C     | Valid; no color/type       |
| `style={{ minHeight: '100vh' }}` on HomePage              | C     | Local layout only          |
| Showcase `sx` demos using theme keys                      | C     | Theme-aware                |
| Direct MUI/Emotion in realestate                          | D     | ADR-009 SSR exception      |
| Icons in azes-ui                                          | D     | ADR-009 showcase exception |
| Competing theme / hard-coded brand colors in product apps | —     | None found                 |

**Category A (must fix):** none.

## Design-token findings

| Consumer                         | Direct dep?                 | Role                                                     |
| -------------------------------- | --------------------------- | -------------------------------------------------------- |
| `@azes/ui-web`                   | yes                         | Maps primitives into MUI theme                           |
| `@azes/ui-native`                | yes                         | Native StyleSheet theme                                  |
| Web product apps                 | no                          | Consume tokens only through ui-web                       |
| `realestate` `transpilePackages` | lists `@azes/design-tokens` | Needed so Next can transpile the ui-web dependency graph |

Do **not** remove `@azes/design-tokens`. Native still requires it. Web apps should keep consuming
it indirectly via ui-web. Future cleanup (optional): document that product apps never add a
direct design-tokens dependency for styling.

## Fixes

None required for Category A. Documentation only in this phase.

## Validation

| Gate                       | Result |
| -------------------------- | ------ |
| `pnpm typecheck`           | PASS   |
| `pnpm lint`                | PASS   |
| `pnpm test`                | PASS   |
| Web app builds (6)         | PASS   |
| `pnpm architecture:verify` | PASS   |

Per-app build: account, admin, agent-platform, agent-site, azes-ui, realestate — all PASS.

## Remaining issues / limitations

- Product shells are minimal; richer product UI will exercise more catalog components later.
- No `axe-core` (explicitly declined; manual checklist in ACCESSIBILITY.md).
- Showcase chunk size / lazy sections remain a Phase 12 follow-up.
- Merge `styles` → `dev` is a release process step after this verification, not a code change.

## Recommended next

Merge readiness review for `styles` → `dev`, or a small follow-up for showcase code-splitting /
optional product-shell Theme Lab controls — only with explicit approval.
