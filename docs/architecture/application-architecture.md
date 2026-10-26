<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/application-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-10-13
║ Purpose: Architecture of the applications and their shells
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Application Architecture

## Applications

- Web SPA (React + TS, Vite): `account`, `admin`, `agent-platform`, `azes-ui` (design-system showcase)
- Web SSR (Next.js App Router): `realestate`, `agent-site` (local `dev` :300), `real-estate-site` (`dev` :400)
- Mobile (React Native, Expo + expo-router): `mobile-account`, `mobile-agent`,
  `mobile-realestate`

## Internal structure (introduced as needed, not all up front)

```text
apps/<web-app>/
├── src/
│   ├── app/          # routing/entry (or Next.js app/ for realestate)
│   ├── components/   # app-local presentational components
│   ├── features/     # business features (property-search, ...)
│   ├── providers/    # theme, query client, store, i18n providers
│   ├── lib/          # app-local helpers
│   └── config/       # app config (env, routes, constants)
├── public/
└── package.json
```

- Create `features/` only when a feature exists. Do not scaffold empty directories.
- Business features live inside the app until multiple products genuinely need them
  (then, and only then, consider a package).
- **New feature pages:** thin `pages/` + `features/` modules —
  [pages-and-features.md](pages-and-features.md), ADR-018,
  `.cursor/rules/page-architecture.mdc`. API runtime:
  `.cursor/rules/apiMenecerAgent.mdc` and [`docs/api/CURRENT-STATE.md`](../api/CURRENT-STATE.md).

## First implementation objective (Phase 10)

Each app is a clean, professional **shell**:

```text
Monorepo -> Global Platform -> Application -> Home Page -> Ready for future Feature layer
```

Every app must: build, run locally, have its own identity, a clean Home page/screen, the
correct platform entry point, required providers, and theme/styling wired via the AZES design
system. **No business logic.**

The Home page identifies: application name, platform, and a dev/environment indicator (when
appropriate) with basic AZES design-system usage. It is NOT a dashboard.

## Explicitly NOT in the first phase

Auth UI, dashboards, property/agent/admin features, complex navigation, real API
functionality, advanced forms, business workflows.

## Platform notes

- **Vite SPA apps** share tooling/tsconfig presets; each has its own dev server/port.
- **Next.js (`realestate`)**: see [../architecture/overview.md] and the Next.js section of
  the API/UI docs — layouts, metadata, loading/error boundaries, and explicit
  client/server component boundaries. Next.js-specific infra stays in the app, not in packages.
- **Expo apps** use expo-router; platform behavior that differs from web is not forced into
  web abstractions.

## Runnability

Canonical developer command from the repository root:

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs every app `dev` task via Turborepo (`turbo run dev --filter=./apps/*`).
Ports and Expo limitations are documented in
[../development/getting-started.md](../development/getting-started.md).
