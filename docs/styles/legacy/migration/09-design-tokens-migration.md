<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/09-design-tokens-migration.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Keep, map, or replace decisions for each token group
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Design token decisions

`@azes/design-tokens` stays React-free. Native still reads `spacingPx` and theme colors.

- Color primitives: keep. Semantic light/dark: map to `colorSchemes`.
- `action.primary`: map to `palette.primary.main`. Light, dark, and contrast text are generated.
- `action.secondary` and feedback colors: map, and keep them stable when primary changes.
- Typography: map onto MUI variants. Do not use `responsiveFontSizes`. Display and mono families stay augmented fields. No font package was added.
- Spacing: map with `spacing: 4`.
- Radius: map `radius.md` (8px) to `shape.borderRadius`. The rest of the scale is on `shape.radiusSm` and the matching fields.
- Web shadows: map `sm`/`md`/`lg` onto elevations 1/2/4. Do not invent a 25-step Material ladder. Native `elevation` numbers stay on the token package.
- `shadow.focus`: replaced on web by a primary color-mix ring.
- Breakpoints: map the token pixel values. `xs` is 0 because MUI requires it.
- z-index: map onto MUI slots and the extra AZES names (`dropdown`, `toast`, and the rest).
- Motion: map durations and easings onto `theme.transitions`.
- `themeToCss()` remains for any caller that still wants `--azes-*`. Web apps no longer inject that stylesheet.
