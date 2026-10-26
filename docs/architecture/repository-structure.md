<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/repository-structure.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Target directory model and what is created when
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Repository Structure

## Target layout

```text
/
├── apps/
│   ├── account/            # React + TS (Vite)
│   ├── admin/              # React + TS (Vite)
│   ├── agent-platform/     # React + TS (Vite)
│   ├── agent-site/         # React + TS (Next.js App Router)
│   ├── azes-ui/            # design-system showcase (Vite)
│   ├── realestate/         # Next.js (App Router)
│   ├── mobile-account/     # React Native (Expo)
│   ├── mobile-agent/       # React Native (Expo)
│   └── mobile-realestate/  # React Native (Expo)
│
├── packages/
│   ├── design-tokens/      # framework-agnostic design language
│   ├── ui-web/             # AZES web design system
│   ├── ui-native/          # AZES native design system
│   ├── api/                # OpenAPI-generated client + TanStack Query layer
│   ├── state/              # Redux Toolkit store
│   ├── auth/               # auth contracts + web/native adapters
│   ├── validation/         # Zod schemas
│   ├── i18n/               # i18next setup + locales
│   ├── permissions/        # resource.action model
│   ├── analytics/          # provider-agnostic analytics
│   ├── logger/             # structured logger
│   ├── feature-flags/      # provider-agnostic flags
│   ├── utils/              # pure utilities (no react)
│   ├── constants/          # stable shared constants
│   ├── types/              # shared TS types
│   └── testing/            # shared test utilities/presets
│
├── tooling/
│   ├── typescript/         # base tsconfigs
│   ├── eslint/             # flat config + import boundaries
│   ├── prettier/           # shared formatting config
│   └── vitest/             # shared test preset
│
├── docs/
├── .cursor/rules/
├── WORKER.md
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Creation policy (do not create everything up front)

The target above is the destination, not a day-1 checklist. Packages are created only when a
phase needs them (see `WORKER.md`).

- **Immediate (Phases 1-4):** root config, `tooling/*`, `design-tokens`, `ui-web`.
- **Near-term (Phases 5-9):** `ui-native`, `api`, `state`, `auth`, `validation`, `i18n`,
  `permissions`, plus `utils`, `constants`, `types` as they are first needed.
- **Later / as-needed:** `analytics`, `logger`, `feature-flags`.
- **Phase 11:** `testing` package + quality gates / E2E.
- **Phase 12:** architecture verification (`pnpm architecture:verify`).

## Deferred vs. adopted from `strukture.md`

- Adopted flat layout from the master prompt (`design-tokens`, `ui-web`, `ui-native` as separate
  packages) instead of the nested `ui/{web,native,tokens}` in `strukture.md`. Rationale in
  [../decisions/ADR-007-package-layout.md](../decisions/ADR-007-package-layout.md).
- Kept a dedicated `packages/types`.
- Deferred `packages/config` (handled by `tooling/*` + per-app config) and `packages/hooks`
  (shared hooks stay app-local until proven shared).

## Do not

- Do not create empty placeholder directories "for later".
- Do not add a package to sidestep a dependency boundary.
