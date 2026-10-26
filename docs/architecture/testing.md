<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/testing.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Testing strategy and quality gates
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Testing Strategy

## Layers

- **Unit:** Vitest — pure logic in `utils`, `validation`, `state` slices/selectors, API client
  helpers.
- **Component:** Testing Library (React) for `ui-web` and web apps; React Native Testing Library
  for `ui-native` and mobile apps.
- **Integration:** feature-level tests within apps (providers + query client + store).
- **Web E2E:** Playwright — smoke flows on app shells; expanded per feature later.
- **Native:** RN Testing Library + appropriate runner; E2E (Detox/Maestro) considered later, not
  adopted now.

## Ownership

- Packages own their own unit/component tests.
- Apps own integration + E2E tests.
- Shared helpers/presets live in `packages/testing` and `tooling/vitest`.
- `@azes/testing/native` provides an RNTL-shaped API for Vitest (real
  `@testing-library/react-native` cannot parse Flow `react-native` under Node).
  Keep RNTL installed for Metro/Jest runners.

## Quality gates (enforced in CI)

- TypeScript typecheck
- ESLint (including dependency boundaries)
- Prettier format check
- Unit + component tests
- Build
- OpenAPI generated-code drift check (from Phase 6)

A phase is complete only when its declared subset of gates passes (see `WORKER.md`).

## Minimum bar

- New logic in `utils`/`validation`/`state` ships with unit tests.
- New `ui-*` components ship with at least a render/interaction test.
- App shells ship with a smoke E2E (web) / render test (native).
- Coverage baseline thresholds live in `@azes/testing` / `@azes/vitest-config`
  (`test:coverage` on opted-in packages).
- Web E2E: `pnpm test:e2e` (sequential Playwright smoke). CI runs a matrix per web shell.
