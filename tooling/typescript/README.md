<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: tooling/typescript/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Document @azes/typescript-config presets (JSON has no headers)
║ Layer: tooling
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/typescript-config`

Shared TypeScript presets for the AZES monorepo.

## Presets

| Export                                | Use                         |
| ------------------------------------- | --------------------------- |
| `@azes/typescript-config/base.json`   | Strict shared base (no DOM) |
| `@azes/typescript-config/react.json`  | Vite / CRA-style React web  |
| `@azes/typescript-config/nextjs.json` | Next.js App Router          |
| `@azes/typescript-config/native.json` | React Native / Expo         |
| `@azes/typescript-config/node.json`   | Node tooling scripts        |

## Usage

```json
{
  "extends": "@azes/typescript-config/react.json",
  "include": ["src"]
}
```

Consuming packages install their own `@types/*` and framework deps. This package only ships JSON.
