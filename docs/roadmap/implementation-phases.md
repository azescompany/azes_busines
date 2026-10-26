<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/roadmap/implementation-phases.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Human-readable summary of the phased roadmap
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Implementation Phases

The authoritative, detailed contract (tasks, validation, checklists, rollback) lives in the root
[WORKER.md](../ops/WORKER.md). This is a readable summary and ordering rationale.

## Ordering rationale

The order follows the dependency graph: foundations and tooling first, then the design language,
then UI, then data (API/state/auth), then cross-cutting packages, then app shells, then quality
hardening and verification. Nothing that depends on X is built before X.

## Phases

- **Phase 0 — Repository Audit & Architecture** (this blueprint). Docs + rules + WORKER.md only.
- **Phase 1 — Monorepo Foundation.** git, pnpm workspace, Turborepo, root tsconfig.
- **Phase 2 — Tooling & Cursor Governance.** ESLint/Prettier/Vitest/TS presets, hooks, CI,
  boundary lint.
- **Phase 3 — Design Tokens.** React-free tokens, web + native outputs.
- **Phase 4 — Web UI Foundation.** `ui-web` over headless primitives.
- **Phase 5 — Native UI Foundation.** `ui-native` over RN primitives.
- **Phase 6 — API / OpenAPI / Orval + TanStack Query.** Generated client, HTTP mutator, query
  layer, drift check.
- **Phase 7 — State Management.** Redux Toolkit store, slices, persistence.
- **Phase 8 — Auth Foundation.** Contracts + web/native adapters.
- **Phase 9 — Validation + i18n + Permissions.** Zod, i18next, `resource.action`.
- **Phase 10 — Application Shells.** All 8 apps: Home only, no business logic.
- **Phase 11 — Testing & Quality Gates.** Unit/component/E2E, CI matrix.
- **Phase 12 — Full Architecture Verification.** Boundary/public-API/header/drift/perf audits
  (`pnpm architecture:verify`; sign-off in `docs/architecture/verification-signoff.md`).

### Planning (not approved)

- [Phase 13 proposal](phase-13-proposal.md) — **PROPOSAL ONLY**. Not part of the execution
  contract until copied into `docs/ops/WORKER.md` after explicit approval.

## Approval

Each phase is `PENDING` until the user explicitly approves it. Only one phase is `IN_PROGRESS`
at a time. The agent never auto-advances (see `docs/ops/WORKER.md` sections 3-4).
