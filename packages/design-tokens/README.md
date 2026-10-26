<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/design-tokens/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Usage guide for @azes/design-tokens
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/design-tokens`

Framework-agnostic AZES design language. No React / React Native dependency.

## Outputs

| Consumer    | Import                           | Use                                                 |
| ----------- | -------------------------------- | --------------------------------------------------- |
| JS / RN     | `@azes/design-tokens`            | `tokens`, `primitives`, `themes`, `spacingPx`, etc. |
| Web / Next  | `@azes/design-tokens/css`        | `themeToCss`, `toCssVariables`                      |
| Themes only | `@azes/design-tokens/themes`     | `lightTheme`, `darkTheme`, `getTheme`               |
| Primitives  | `@azes/design-tokens/primitives` | foundation scales                                   |

## Layers

1. **Primitives** — raw foundation values (color palette, spacing, type, motion, …).
2. **Semantic** — role-based colors for light/dark.
3. **Themes** — composed foundations for each theme name (`light` | `dark`).

Component-level tokens are deferred until UI packages need them (Phase 4+).

## Example

```ts
import { tokens, themeToCss, themes } from '@azes/design-tokens';

tokens.primitives.spacing[4];
themeToCss(themes.light); // CSS custom properties for :root[data-azes-theme="light"]
```

## Rules

- Do not import from `@azes/design-tokens/src/...`.
- Do not add React/UI/API dependencies to this package.
- Style Dictionary may be introduced later; the public contract stays TS objects + CSS helpers.
