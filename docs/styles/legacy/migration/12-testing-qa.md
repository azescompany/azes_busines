<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/12-testing-qa.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Tests that cover the web theme migration
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Testing and QA

- `createAzesTheme` tests check the default primary `#167764`, generated contrast text,
  stable secondary and feedback colors, both color schemes, spacing factor 4, and the
  `md` breakpoint at 768.
- `AzesThemeProvider` renders children with `CssBaseline`.
- `Box`, `Stack`, `Text`, and `Button` keep render and click tests.
- `@azes/azes-ui` checks the shell heading and that choosing the red seed sets the hex
  field to `#C02B21`.
- Web shells still assert Home identity (name, platform, environment).
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm architecture:verify` are the
  repository gates for this migration. Native packages are unchanged.
