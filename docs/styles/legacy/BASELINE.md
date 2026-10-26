<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/BASELINE.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Validation baseline recorded before the styles roadmap starts
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Baseline (styles branch, Phase 0)

Recorded on 2026-10-02 before any roadmap work. Each later phase must keep every row green.

## Git

- Branch `styles` was created from `dev` at `d564a4e`. It did not exist before.
- The MUI migration that had been uncommitted on `dev` was committed first, as six grouped commits:

| Commit    | Scope                                                                       |
| --------- | --------------------------------------------------------------------------- |
| `67cd7f5` | `packages/ui-web`: MUI v9 theme, provider, brand helpers, catalog, lockfile |
| `0a22620` | Vite apps (account, admin, agent-platform, agent-site)                      |
| `30cd2b2` | realestate (Next.js App Router integration)                                 |
| `5122fe4` | `apps/azes-ui` showcase                                                     |
| `43d9447` | ESLint MUI boundaries, scaffold scripts, docs-sync                          |
| `d564a4e` | ADR-009, docs, WORKER.md, strukture.md                                      |

No git identity is configured on this machine. The commits reuse the existing repo author
(`codder`) through `git -c`. The global git config was not changed.

## Versions (not changed during planning)

| Package                | Declared in `ui-web` | Resolved in lockfile |
| ---------------------- | -------------------- | -------------------- |
| `@mui/material`        | `9.3.1` (exact)      | 9.3.1                |
| `@emotion/react`       | `^11.14.0` (range)   | 11.14.0              |
| `@emotion/styled`      | `^11.14.1` (range)   | 11.14.1              |
| `@mui/icons-material`  | `9.3.1` (azes-ui)    | 9.3.1                |
| `@mui/material-nextjs` | `9.4.0` (realestate) | 9.4.0                |

Discrepancies, documented and not fixed:

- The Emotion versions are caret ranges, so a fresh lockfile could resolve a newer 11.x.
- `@mui/material-nextjs` is 9.4.0 while `@mui/material` is 9.3.1. It works today, but pinning
  them together is a separate, explicitly approved task.

## Validation commands

All of these are existing scripts from the root `package.json` or `apps/azes-ui/package.json`.

| Command                           | Result | Notes                                                                       |
| --------------------------------- | ------ | --------------------------------------------------------------------------- |
| `pnpm build`                      | PASS   | 19/19 tasks. Turbo warns that the mobile apps produce no build outputs.     |
| `pnpm typecheck`                  | PASS   | 26/26 tasks                                                                 |
| `pnpm test`                       | PASS   | 26/26 tasks                                                                 |
| `pnpm lint`                       | PASS   | Root ESLint with `--max-warnings 0`, plus per-package lint                  |
| `pnpm format:check`               | PASS   | All files formatted                                                         |
| `pnpm architecture:verify`        | PASS   | Headers, boundaries, bundle sizes, docs/ADR sync                            |
| `pnpm --filter @azes/azes-ui dev` | PASS   | Serves on port 5177. The AppBar, Primary/Mode controls and Overview render. |

On Windows PowerShell, prefix `C:\Program Files\nodejs` to `PATH` and use `corepack pnpm`.
Git Bash has a global `pnpm` 10.30.3.

## Known issues carried into the roadmap

- `pnpm` warns about ignored dependency build scripts. This is unrelated to styling.
- Turbo reports `no output files found` for the `@azes/mobile-*#build` tasks. This is unrelated to styling.
- Secondary color is fixed (navy) and cannot follow a brand input.
- There are no density presets.
- `theme.components` only overrides `MuiCssBaseline`, `MuiButton` and `MuiButtonBase`.
- Shadows only fill elevations 1, 2 and 4. Every other elevation is `none`.
- `apps/azes-ui/src/showcase/Showcase.tsx` is a single file of about 550 lines.
- `@azes/design-tokens` still exports `themeToCss` and `toCssVariables`. No web consumer uses
  them any more.
