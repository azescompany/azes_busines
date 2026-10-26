<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/01-architecture.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Target web theme architecture
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Architecture

```text
design-tokens (no React, no MUI)
        |
        +--> ui-native (unchanged, React Native styles)
        |
        +--> ui-web createAzesTheme
                  |
                  +--> MUI theme (cssVariables + colorSchemes)
                            |
                            +--> AzesThemeProvider + CssBaseline
                                      |
                                      +--> Vite apps, Next.js, azes-ui
```

`@azes/ui-web` is the only component import for product apps. MUI is the styling engine
inside that package. A separate `packages/theme` was rejected: it would either depend on
React or duplicate `ui-web`.

Legacy `--azes-*` and `--mui-*` coexist until the deprecation phase. MUI keeps the default
`--mui` prefix so the two sets do not collide.

See [ADR-009](../../decisions/ADR-009-mui-web-theme.md) and
[ui-architecture.md](../../architecture/ui-architecture.md).
