<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/04-light-dark-mode.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Light, dark, and system color schemes
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Light, dark, and system

Light values come from `semanticColorLight`. Dark values come from `semanticColorDark`.
Both schemes share the same primary seed.

Mode is `system` until the user picks light or dark. MUI stores the choice under
`azes-mode` and `azes-color-scheme`.

Next.js renders `InitColorSchemeScript` with the same attribute and storage keys, and sets
`suppressHydrationWarning` on `<html>`. Vite shells set `data-azes-color-scheme` from
`localStorage` in `index.html` before the module script runs.

Primary persistence uses the `azes-primary` cookie (read on the Next server) and
`localStorage` key `azes-primary` (read by the showcase). A missing value stays teal.
