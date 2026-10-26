<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/state-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Server vs client state ownership (TanStack Query + Redux Toolkit)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# State Architecture

## The core boundary

```text
SERVER STATE  -> TanStack Query
CLIENT/UI STATE -> Redux Toolkit
```

Do not put API response data into Redux unless there is a very specific, documented reason.

## TanStack Query owns

Fetching, caching, stale state, refetching, retries, pagination, infinite queries, mutation
lifecycle, optimistic updates (where appropriate), and server-state synchronization. It lives in
`packages/api` (`query/`, `mutations/`). See [api-architecture.md](api-architecture.md).

## Redux Toolkit owns (justified client/global state only)

Examples: session/client state, current workspace, selected organization, global preferences,
application-level UI state, cross-route workflows, persisted client preferences.

- Store architecture: single typed store per app composed from `@azes/state` slices.
- Slice boundaries: one slice per cohesive concern; no god-slices.
- Selectors: memoized; components select minimal state.
- Middleware: RTK defaults + persistence; add custom middleware only when justified.
- Persistence: web storage (localStorage) on web; secure/async storage on native (via adapter).
- Hydration: documented per platform; avoid hydration mismatches on Next.js.

## MUST NOT enter Redux

- Server/remote data owned by TanStack Query (lists, entities fetched from the API).
- Derived data that can be computed from queries/selectors.
- Ephemeral local component state that never crosses routes/components.
- Secrets/tokens in plain persisted state (use secure adapters — see auth).

## Rationale

See [../decisions/ADR-002-state-management.md](../decisions/ADR-002-state-management.md).
