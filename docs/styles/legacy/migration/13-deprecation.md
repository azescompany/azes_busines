<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/13-deprecation.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: What was removed after every web app opted into MUI
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Deprecation

Removed from `@azes/ui-web` after every web app used `AzesThemeProvider`:

- `src/styles.css` and the `./styles.css` package export
- the hand-rolled `ThemeProvider` that injected `--azes-*`
- `@radix-ui/react-slot` and the `Button` `asChild` prop

`Box`, `Stack`, `Text`, and `Button` remain, implemented with MUI. App stylesheets no
longer reference `--azes-font-sans`, `--azes-color-bg`, or `--azes-color-fg`.

`@azes/ui-native` and `themeToCss()` were not removed. Native theme behavior is unchanged.
