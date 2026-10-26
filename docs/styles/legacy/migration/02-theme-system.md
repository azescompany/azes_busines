<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/02-theme-system.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: How createAzesTheme is built and when it is rebuilt
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Theme system

`createAzesTheme({ primary })` in `@azes/ui-web` returns one Material UI theme:

- `cssVariables.colorSchemeSelector` is `data-azes-color-scheme`
- `colorSchemes.light` and `colorSchemes.dark` are both present
- `spacing` is `4`, so token index `n` matches `theme.spacing(n)` (4px grid)
- breakpoints use the design-token pixel values, including `2xl` at 1536
- shadows place token `sm` / `md` / `lg` at elevations 1, 2, and 4; other elevations are `none`

`AzesThemeProvider` memoizes that theme on the resolved primary string. Light, dark, and
system mode use MUI `ThemeProvider` `defaultMode="system"` and do not call `createTheme`
again. Storage keys are `azes-mode` and `azes-color-scheme`.

Default primary is `color.teal600` (`#167764`). `resolveBrandPrimary` accepts the seed
names `teal`, `navy`, `green`, `amber`, `red`, or a `#rrggbb` value.
