<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: .github/workflows/ci.yml.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Sibling documentation for ci.yml (YAML header lives in the workflow file)
║ Layer: tooling
╚══════════════════════════════════════════════════════════════╝
-->

# CI workflow

Source of truth: [ci.yml](./ci.yml).

Runs on push/PR to `main` / `master`:

1. `pnpm install --frozen-lockfile`
2. `pnpm format:check`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm build`

Dependency-boundary lint is included in `pnpm lint` via `@azes/eslint-config`.
