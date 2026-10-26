<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/08-components.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Which components are wrapped and which stay on MUI defaults
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Components

Public layout primitives stay `Box`, `Stack`, `Text`, and `Button`. They are implemented
with MUI and keep the previous spacing and variant names (`primary`, `secondary`, `ghost`).

Theme overrides are limited to `MuiCssBaseline`, `MuiButton` (sizes and radius), and
`MuiButtonBase` (primary-derived focus ring). Other components use MUI defaults.

The showcase imports additional components through named re-exports in `@azes/ui-web`
(`AppBar`, `Drawer`, `TextField`, `Dialog`, `Table`, and the rest used by the demo).
There is no `export *` from `@mui/material`.
