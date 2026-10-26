<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: tooling/eslint/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Usage guide for @azes/eslint-config
║ Layer: tooling
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/eslint-config`

Shared ESLint 9 flat configs for the AZES monorepo.

## Presets

| Import                                             | Use                                                    |
| -------------------------------------------------- | ------------------------------------------------------ |
| `@azes/eslint-config` / `@azes/eslint-config/base` | Root + packages (TS, boundaries, Prettier)             |
| `@azes/eslint-config/react`                        | Vite React web apps / `ui-web`                         |
| `@azes/eslint-config/nextjs`                       | Next.js apps (compose with `eslint-config-next` later) |
| `@azes/eslint-config/native`                       | Expo / RN apps / `ui-native`                           |

## Root usage

```js
import azes from '@azes/eslint-config';

export default [...azes];
```

Dependency boundaries and deep-import bans are enabled in the base preset.
