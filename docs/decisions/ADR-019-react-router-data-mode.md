<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-019-react-router-data-mode.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: ADR — hash router → React Router data mode inside apps/admin
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-019: React Router data mode in apps/admin

## Status

Accepted — 2026-10-10

## Context

Admin used a hand-rolled hash router (`useAdminHashRoute` + `window.location.hash`). That blocked clean URLs, standard deep links, `useBlocker`, and `ScrollRestoration`. Product menus already emit path-like `menuUrl` values (`/announcement`, `/users`).

## Decision

1. Adopt **React Router data mode** in `apps/admin` only: `createBrowserRouter` + `RouterProvider` (`react-router` + `react-router/dom`).
2. Keep all router code under `apps/admin/src/app/router/` — **no** shared router package.
3. Preserve `AzesRouterAdapter` / `AzesNavProvider` in `ui-web` so the design system stays router-agnostic; the app supplies `Link` + identity `toHref`.
4. Replace `#/path` with `/path`. One-time migrate for bookmarks; auth handoff `#azes_auth=` unchanged.

## Consequences

- Hosting must fall back to `index.html` for unknown paths.
- Features may use `useNavigate` / `useSearchParams` / `useQueryState`; they must not own the route tree.
- Version pinned to `react-router@7.18.4` (compatible with workspace React 19.1; npm also publishes 8.x requiring React ≥19.2.7).
