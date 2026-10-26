<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/00-current-state-audit.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Audit of styling before the MUI migration
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Current state audit

Recorded before any MUI runtime code. Lockfile had no `@mui/*`, `@emotion/*`, or
`@mui/icons-material`.

## Workspace

- pnpm 10.30.3, Turborepo, Node `>=22`.
- Git branch at audit time: `main` only, clean, tracking `origin/main`. Implementation
  continues on `dev` created from that commit.
- Web: Vite `account` 5173, `admin` 5174, `agent-platform` 5175, `agent-site` 5176;
  Next.js 15.4 `realestate` 3000.
- Expo: `mobile-account` 8081, `mobile-agent` 8082, `mobile-realestate` 8083. These use
  `@azes/ui-native` and are out of scope.

## What the web shell actually does

- `@azes/design-tokens` is React-free. `themeToCss()` emits `--azes-*` on
  `:root[data-azes-theme]`.
- `@azes/ui-web` has `ThemeProvider`, `Box`, `Stack`, `Text`, `Button`, and
  `src/styles.css` (BEM). The only third-party UI dependency is `@radix-ui/react-slot`.
- Every web app imports `@azes/ui-web/styles.css` and mounts the old `ThemeProvider`.
- App body CSS (`apps/*/src/styles.css`, `apps/realestate/app/globals.css`) reads
  `--azes-font-sans`, `--azes-color-bg`, and `--azes-color-fg`. Those names are not
  emitted. The generator uses `--azes-typography-fontFamily-sans` and
  `--azes-color-background-canvas`. Body color therefore falls back to hardcoded hex.
- Brand action is `color.teal600` (`#167764`). Feedback colors are separate. Secondary is
  navy, not a tint of teal. `shadow.focus` is a hardcoded teal ring.
- Fonts are CSS stacks (`Source Sans 3`, `Source Serif 4`, `IBM Plex Mono`) with system
  fallbacks. No font files are in the repo.
- `WORKER.md` phases 0–12 are complete. `docs/roadmap/phase-13-proposal.md` is an
  unapproved auth slice and is not this migration.
