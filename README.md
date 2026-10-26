<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Root entry point for the AZES frontend monorepo
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES Monorepo

Enterprise frontend monorepo for AZES Company applications (web, Next.js, React Native),
shared platform packages, and tooling.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Package scope:** `@azes/*`
- **Language:** TypeScript (strict)

## Workspace layout

```text
apps/        # Product applications (created in later phases)
packages/    # Shared platform packages (created in later phases)
tooling/     # Shared ESLint, Prettier, TypeScript, Vitest configs (Phase 2+)
docs/        # Architecture blueprint and ADRs
```

Workspace globs are defined in `pnpm-workspace.yaml`. Empty placeholder packages are not
created up front — packages and apps appear when their phase requires them.

## Prerequisites

- Node.js `>=22` (see `.nvmrc`)
- pnpm `>=10` (pinned via `packageManager` in `package.json`)

## Commands

```bash
pnpm install
pnpm build
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm format
pnpm format:check
```

Shared configs live under `tooling/` (`@azes/typescript-config`, `@azes/eslint-config`,
`@azes/prettier-config`, `@azes/vitest-config`). Product packages/apps are added in later phases.

## TypeScript strategy (Phase 1)

- Root [`tsconfig.json`](tsconfig.json) is the **base** compiler options for the monorepo.
- Future packages/apps will `extends` this file (or Phase 2 `tooling/typescript` presets that
  themselves extend the root base).
- Project references will be introduced when the first buildable packages appear; until then the
  root config is a shared options base only (no fake package references).

## Documentation

- Execution contract: [`WORKER.md`](WORKER.md)
- Architecture: [`docs/`](docs/README.md)
- Cursor rules: [`.cursor/rules/`](.cursor/rules/)

## Current phase

See [`WORKER.md`](WORKER.md) for the active phase and approval protocol. Do not start a new
implementation phase without explicit approval.
