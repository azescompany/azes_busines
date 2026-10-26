<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-013-mui-x-community.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-09
║ Purpose: Decision record for MUI X community tier as lazy ui-web subpaths
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-013: MUI X community tier only, as lazy subpaths

## Status

Accepted (2026-10-04). Amended 2026-10-09 (sticky actions note).

## Context

Dashboards need data tables and charts. MUI X 9.x peers on MUI 9 and React 19. Pro and Premium
tiers need a commercial license.

## Options

1. Third-party grid and chart libraries (second styling system, separate theming).
2. MUI X Pro/Premium now.
3. MUI X MIT packages behind `@azes/ui-web/data-grid` and `/charts`, loaded lazily.

## Decision

Option 3. `AzesDataGrid`, `AzesLineChart`, `AzesBarChart`, `AzesPieChart`. Date pickers and tree
view are not installed until needed. Any Pro feature needs a new ADR and a license.

**Sticky trailing actions (2026-10-09):** Keep the actions column visible while scrolling
horizontally via CSS `position: sticky` + `columnBufferPx` on the MIT grid — not Pro column
pinning. If that pattern proves insufficient, revisit Pro behind a new ADR.

## Consequences

- Same theme, same dark mode, no extra theming code in core.
- Grid and chart code stays out of initial chunks.
- Sticky actions are a CSS/MIT compromise; virtualization may still unmount far columns if
  `columnBufferPx` is lowered.
