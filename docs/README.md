<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-20
║ Purpose: Documentation index for the AZES frontend monorepo
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES Monorepo Documentation

This is the architectural blueprint for the AZES enterprise frontend monorepo. It is written
for future engineers and Cursor agents. Implementation proceeds in approval-gated phases
described in [ops/WORKER.md](ops/WORKER.md). Phases 0–11 are complete; Phase 12 records
architecture verification sign-off in
[architecture/verification-signoff.md](architecture/verification-signoff.md).

## How to read these docs

- Start with [architecture/overview.md](architecture/overview.md).
- Understand the rules in [development/dependency-rules.md](development/dependency-rules.md).
- Follow [development/getting-started.md](development/getting-started.md) to run the workspace.
- The execution contract lives in [ops/WORKER.md](ops/WORKER.md).
- Academy LMS roadmap: [academy/roadmap/CLAUDE.MD](academy/roadmap/CLAUDE.MD) (+ DELTA).
- Academy UI / menyu xəritəsi: [academy/chat/CHAT.MD](academy/chat/CHAT.MD) (+ DELTA) və
  [menus/](menus/README.md).
- Agent roster (qısa): [agents/my_cursor_gents.md](agents/my_cursor_gents.md).

## Structure

- `academy/` — LMS plan (`roadmap/`), UI spec (`chat/`), ops (`ops/`), audit, qərarlar.
- `menus/` — rol əsaslı səhifə spesifikasiyaları (`superadmin` / `orgadmin` / `instructor` /
  `student` / `guest`).
- `ops/` — monorepo execution contract (`WORKER.md`).
- `agents/` — Cursor agent roster qısa istinad.
- `monorepo/` — struktur / tsconfig qeydləri.
- `architecture/` — how the system is designed (overview, structure, dependency graph,
  apps, packages, UI, state, API, auth, i18n, testing, security).
- `decisions/` — Architecture Decision Records (ADRs).
- `development/` — getting started, workflow, dependency rules, contribution guide.
- `roadmap/` — the implementation phases; Phase 13 planning-only proposal lives here until
  approved into `ops/WORKER.md`.
- `styles/` — the AZES web UI platform on Material UI: tokens, theme, layout, navigation,
  settings, components, MUI X, forms ([styles/README.md](styles/README.md)). v1 docs are frozen
  in `styles/legacy/`. The auth Phase 13 proposal is a separate track.

## Technology stack (summary)

- Monorepo: Turborepo + pnpm workspaces (scope `@azes/*`)
- Web SPA: React + TypeScript on Vite (`account`, `admin`, `agent-platform`, `azes-ui`)
- SSR/SEO: Next.js App Router (`realestate`, `agent-site`)
- Mobile: React Native via Expo (`mobile-account`, `mobile-agent`, `mobile-realestate`)
- Server state: TanStack Query · Client state: Redux Toolkit
- API: OpenAPI contract → Orval-generated client
- Validation: Zod · Forms: React Hook Form · i18n: i18next
- Testing: Vitest + Testing Library + Playwright (web E2E) + RN Testing Library
- Lint/format: ESLint + Prettier

## Governance

- Cursor rules: `.cursor/rules/*.mdc`
- File header policy: [architecture/overview.md](architecture/overview.md) and the
  `comment-header` rule.
- Architecture verification: [architecture/verification-signoff.md](architecture/verification-signoff.md)
  (`pnpm architecture:verify`).
- Every phase requires explicit user approval before it starts (see `ops/WORKER.md`).
