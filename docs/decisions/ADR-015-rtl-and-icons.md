<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-015-rtl-and-icons.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for the RTL strategy and the curated icons subpath
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-015: RTL strategy and the icons subpath

## Status

Accepted (2026-10-04). The icons part supersedes the v1 decision "no curated icons barrel".

## RTL

**Context.** MUI flips its own styles for RTL only with an Emotion cache that uses
`stylis-plugin-rtl`. AZES target locales (Azerbaijani, English, Russian) are LTR; RTL demand is
not confirmed.

**Options.** (1) Add the plugin now. (2) CSS logical properties only. (3) Logical properties now,
plugin only when RTL is approved.

**Decision.** Option 3. `direction` exists in the theme input and settings; its drawer control
is hidden by default. Platform code uses logical properties (`paddingInlineStart`,
`insetInlineStart`). Unblocking adds `@emotion/cache` + `stylis-plugin-rtl` in an `AzesRtlCache`
used by `AzesUiProvider` when `direction === 'rtl'`.

## Icons

**Context.** Apps may not import `@mui/*`, so they had no public path to icons.

**Decision.** `@azes/ui-web/icons` exports a curated set with semantic names, each a path
re-export of `@mui/icons-material`, plus `createAzesIcon`. No Iconify.

**Consequences.** Icons are replaceable behind AZES names; tree shaking keeps only used icons.
