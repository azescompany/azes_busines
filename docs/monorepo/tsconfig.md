<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: tsconfig.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Document root tsconfig.json (JSON cannot contain file headers)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Root `tsconfig.json`

Strict JSON cannot carry the AZES comment header. This sibling document owns that metadata.

## Role

- Shared **base** TypeScript options live in `@azes/typescript-config/base.json`
  (`tooling/typescript`). Root `tsconfig.json` extends that package.
- Packages and apps should `extends` the appropriate preset
  (`react` / `nextjs` / `native` / `node`).
- Until product packages exist, the root project includes the real workspace JS config entry
  points (`eslint.config.js`, `prettier.config.js`, `tooling/**/*.js`) with `allowJs` /
  `checkJs: false` so `tsc` and the IDE have valid inputs without placeholder packages.

## Project references strategy

1. Phase 1: root base only — no synthetic package references.
2. When the first buildable packages exist: each package may enable `composite` as needed and
   the root (or a solution `tsconfig`) may list `references`.
3. Apps consume packages via workspace protocol (`workspace:*`) and TypeScript path/project
   references — never by deep-importing package `src/` paths.

## Ownership of specialized presets

Platform-specific configs (React, Next.js, React Native, Node) are deferred to Phase 2
(`tooling/typescript`). Do not invent them in Phase 1.
