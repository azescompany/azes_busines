<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/05-global-styles.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: CssBaseline and the extra global rules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Global styles

`AzesThemeProvider` renders `CssBaseline`. Extra rules live on
`MuiCssBaseline.styleOverrides` and read `theme.vars`:

- `box-sizing: border-box` on `html`, inherited by descendants
- `html`, `body`, and `#root` fill the viewport
- body color, background, and the sans font stack from design tokens
- `::selection` mixed from primary
- links use `palette.text.link`
- `scrollbar-color` follows divider and background
- `prefers-reduced-motion: reduce` shortens animation and transition

App stylesheets only reset margin and min-height. They do not set a second background color.
