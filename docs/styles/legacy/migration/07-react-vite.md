<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/07-react-vite.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Vite app integration for the MUI theme
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# React and Vite

Vite apps do not use `AppRouterCacheProvider`. Emotion runs on the client.

Each shell keeps its existing provider order: TanStack Query, Redux store, i18n, then
`AzesThemeProvider`. `CssBaseline` is inside the theme provider.

`index.html` sets `data-azes-color-scheme` from `azes-mode` and `prefers-color-scheme`
before React starts. Product shells are `account` (5173), `admin` (5174),
`agent-platform` (5175), and `agent-site` (5176).
