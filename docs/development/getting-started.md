<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/development/getting-started.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: How to set up and run the monorepo from the root
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Getting Started

## Prerequisites

- Node.js (version pinned in `.nvmrc`)
- pnpm (version pinned in root `package.json` `packageManager`)
- For mobile runtime on a device/emulator: Expo Go or a dev client, plus Xcode (iOS) /
  Android Studio (Android) as needed

## Install

```bash
pnpm install
```

## Canonical local development

```bash
pnpm dev
```

This runs **all app `dev` tasks** through Turborepo (`turbo run dev --filter=./apps/*`).

You do **not** need to start apps with one-by-one `pnpm --filter …` commands for day-to-day
work.

### What starts

| App                       | Stack   | Dev process          | Port |
| ------------------------- | ------- | -------------------- | ---- |
| `@azes/account`           | Vite    | `vite`               | 100  |
| `@azes/admin`             | Vite    | `vite`               | 200  |
| `@azes/agent-site`        | Next.js | `next dev`           | 300  |
| `@azes/realestate`        | Next.js | `next dev`           | 3001 |
| `@azes/real-estate-site`  | Next.js | `next dev`           | 400  |
| `@azes/agent-platform`    | Vite    | `vite`               | 5175 |
| `@azes/azes-ui`           | Vite    | `vite`               | 700  |
| `@azes/mobile-account`    | Expo    | Metro (`expo start`) | 8081 |
| `@azes/mobile-agent`      | Expo    | Metro (`expo start`) | 8082 |
| `@azes/mobile-realestate` | Expo    | Metro (`expo start`) | 8083 |

### Web apps

Open the URLs in a browser once Vite/Next report ready (e.g. `http://127.0.0.1:100` account,
`http://127.0.0.1:200` admin, `http://127.0.0.1:300` agent-site,
`http://127.0.0.1:400` real-estate-site).

### Mobile apps (Expo)

`pnpm dev` **does** start Metro for each mobile app on distinct ports. That is not the same as
opening the UI in a browser:

- Metro/dev server process: started by root `pnpm dev`
- On-device UI: requires a physical device or emulator + Expo Go / dev client, then connect to
  the matching Metro port
- Pressing `i` / `a` inside an Expo interactive session launches simulators when tooling is
  installed; under Turborepo stream UI that interactive prompt may not be usable — open Expo
  Go/dev client against the printed URL/QR instead

## Other common commands

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm format
pnpm api:generate
pnpm architecture:verify
```

## Optional: single app

```bash
pnpm --filter @azes/account dev
pnpm --filter @azes/realestate dev
pnpm --filter @azes/mobile-account dev
```

## Next

- Read [development-workflow.md](development-workflow.md).
- Read [dependency-rules.md](dependency-rules.md) before adding imports/dependencies.
