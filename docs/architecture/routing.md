<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/routing.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-11
║ Purpose: Admin SPA routing — React Router data mode, PATHS, guards, URL state
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Admin routing (React Router data mode)

Canonical implementation: `apps/admin/src/app/router/`.  
Decision record: [ADR-019](../decisions/ADR-019-react-router-data-mode.md).

## Stack

| Item           | Choice                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| Package        | `react-router@7.18.4` (single package; no `react-router-dom`)                        |
| Mode           | **Data mode** SPA — `createBrowserRouter` + `RouterProvider` from `react-router/dom` |
| Framework mode | Not used (no Vite RR plugin / file routes / SSR)                                     |
| Basename       | `import.meta.env.BASE_URL`                                                           |
| Locale prefix  | `/en                                                                                 | az  | ru/...` — language is the first path segment |

## Layout

```text
app/router/
  paths.ts              PATHS + pathTo helpers
  routes.tsx            route tree
  AppRouter.tsx         createBrowserRouter + RouterProvider
  guards/               RequireAuth, RequireRole
  RouteError.tsx        errorElement / ErrorBoundary
  NotFoundRoute.tsx     splat 404
  AzesNavBridge.tsx     AzesNavProvider + adapter Link
  useQueryState.ts      search params
  useUnsavedChangesGuard.ts  useBlocker + dialog + beforeunload
  migrateLegacyHash.ts  one-time `#/x` → `/x`
```

`ui-web` never imports a router. Apps pass `AzesRouterAdapter` (`pathname`, `toHref`, `LinkComponent`) into `AzesNavProvider`.

## Route tree (summary)

- `/` → redirect to `/{storedLocale}/auth-lab`
- `/en|az|ru` → `LocaleGate` (syncs i18n) → `RequireAuth` → `AdminShell`
  - index → relative `auth-lab`
  - `auth-lab`, `docs`, `users`, `announcement`, `user-announcement`, `sold-item` — `lazy`
  - `*` → `NotFoundRoute`
- Unprefixed `/users` (etc.) → `UnprefixedLocaleRedirect` → `/{locale}/users`
- `ErrorBoundary` / `RouteError` at root

Logical `PATHS` stay locale-free (`/users`). `useAzesRouterAdapter` exposes logical
`pathname` for nav matching and `toHref` that prefixes the active locale. Language menu
updates both i18n and the URL segment (`replaceLocaleInPathname`).

## Guards

- **RequireAuth**: reads `useAuthSession()`. Unauthenticated → fullscreen loader + `redirectToAccountLogin` (no in-app login). Enforced via `ADMIN_ROUTER_AUTH_ENFORCED` (default `true`). Boot already redirects in `AppProviders`.
- **RequireRole**: allowlist `roleId` / `role`; otherwise Forbidden UI.

## Search params

| Concern                           | History   | Keys                              |
| --------------------------------- | --------- | --------------------------------- |
| Filters / pagination              | `replace` | `page`, `pageSize`, filter fields |
| Ad details dialog / filters panel | `push`    | `ad`, `panel=adsFilters`          |

Empty values are deleted from the URL. Helpers: `useQueryState`, `useQueryNumber`, `useQueryPatch`.

## Dirty navigation

`useUnsavedChangesGuard(isDirty)` — `useBlocker` + `useAzesDialog` confirm + `beforeunload`. Accordion/side-panel keep their local discard dialogs for in-view close.

## Scroll

`ScrollRestoration` + reset `[data-azes-scoop]` (L-shell scrollport) and
`[data-azes-main-scroll]` on pathname change. The scoop is the real overflow
scroller in dual chrome — resetting only `main` leaves the previous page’s
`scrollTop` and the next route opens already scrolled.

## Hosting

Prod must serve the SPA for all paths (`try_files $uri /index.html` on Nginx). If a host cannot do path rewrites, switch to `createHashRouter` in `AppRouter.tsx` (one-line API change) — documented only; **no env flag** in code.

## Legacy hash

`main.tsx` calls `migrateLegacyHashRoute()` once: `#/users` → `/users`, then the
unprefixed redirect adds `/{locale}`. Does **not** touch `#azes_auth=` handoff.

## Add a page checklist

1. Add `PATHS.<name>` in `shared/config/paths.ts` (re-exported from `app/router/paths.ts`).
2. Feature module + thin `pages/<name>/index.tsx`.
3. Register `lazy` route in `routes.tsx` using `PATHS` only.
4. i18n + tests with `createMemoryRouter` / `renderWithRouter`.
5. Prefer URL state via `useQueryState` for shareable UI.
