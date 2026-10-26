<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/api-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-09
║ Purpose: OpenAPI + Orval + TanStack Query API layer strategy
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# API Architecture

The backend is external. The frontend consumes backend contracts via OpenAPI/Swagger, generated
into a typed client with Orval and surfaced through TanStack Query.

**Agent + living snapshot:** `.cursor/rules/apiMenecerAgent.mdc` and
[`docs/api/CURRENT-STATE.md`](../api/CURRENT-STATE.md) — how the runtime works **now**.
Update the snapshot when API/Query/auth-bridge behavior changes.

```text
Backend -> OpenAPI/Swagger JSON -> Orval -> Generated TS API -> TanStack Query -> Applications
```

## Package layout

```text
packages/api/
├── generated/     # Orval output — NEVER hand-edited
├── client/        # HTTP client (auth/header injection, error normalization, base URL)
├── query/         # query hooks, query keys, cache policy
├── mutations/     # mutation hooks, invalidation
├── config/        # env/base-url/runtime config
└── index.ts       # public entry point
```

Generated code is strictly separated from manually maintained code.

## Strategy decisions (to implement in Phase 6)

- **OpenAPI source:** committed spec file (or pinned remote URL) under version control; the
  chosen source is documented in `packages/api` when created.
- **Orval config:** `orval.config.ts` targets the spec; output mode separates schemas and hooks;
  custom mutator points at the shared HTTP client.
- **Generation command:** `pnpm api:generate` (root script) regenerates `generated/`.
- **Generated output location:** `packages/api/generated/` only.
- **HTTP client:** a single client (custom Orval mutator) centralizing base URL, headers,
  timeouts, and interceptors.
- **Auth/header injection:** access token attached by the client via the auth adapter; no manual
  header wiring in app code.
- **Error normalization:** transform transport/HTTP errors into a normalized `AzesApiError`.
- **Query configuration:** default `staleTime`, `retry`, and cache settings per resource class.
- **Query keys:** centralized, typed key factory; no ad-hoc string keys.
- **Invalidation:** mutations declare which query keys they invalidate.
- **Environment handling:** base URL from env (see [security.md](security.md) and env rules).
- **CI validation:** a drift check regenerates and fails if `generated/` is out of date.
- **Regeneration workflow:** update spec → `pnpm api:generate` → review diff → commit.

## Rules

- Never edit files under `generated/`.
- Apps import typed hooks from `@azes/api`, not raw fetch calls.
- See [../decisions/ADR-003-api-generation.md](../decisions/ADR-003-api-generation.md) and
  `.cursor/rules/api-generation.mdc`.
