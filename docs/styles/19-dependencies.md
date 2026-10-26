<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/19-dependencies.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Dependency matrix for the web UI platform and the rules for adding one
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Dependencies

## Matrix

| Package                                    | Why                         | MUI alternative                  | Status                      | Bundle / complexity risk             | Production safety |
| ------------------------------------------ | --------------------------- | -------------------------------- | --------------------------- | ------------------------------------ | ----------------- |
| `@mui/material` 9.3.1                      | Foundation                  | —                                | Required                    | Known; already shipped               | Safe              |
| `@emotion/react`, `/styled`                | MUI engine                  | —                                | Required                    | Known                                | Safe              |
| `@mui/icons-material` 9.3.1                | Default icon set            | `createSvgIcon` for custom       | Required                    | Low with path imports only           | Safe              |
| `@tanstack/react-table` 8.x                | Default product tables      | Hand-rolled table state          | Required (`/table`)         | Small; lazy subpath                  | Safe              |
| `@mui/x-data-grid` 9.x (MIT)               | Legacy DataGrid demos       | Prefer `AzesTable` (21)          | Optional (legacy)           | High (~100 kB gz), lazy `/data-grid` | Safe              |
| `@mui/x-charts` 9.x (MIT)                  | Dashboards                  | none                             | Required                    | Medium, lazy subpath                 | Safe              |
| `react-hook-form` 7.x                      | Performant form state       | none                             | Required                    | Low (~10 kB gz)                      | Safe              |
| `@hookform/resolvers` 5.x                  | zod bridge (in apps)        | none                             | Required in apps with forms | Low                                  | Safe              |
| `zod` 3.25 (via `@azes/validation`)        | Schemas                     | none                             | Existing                    | Already in repo                      | Safe              |
| `@mui/x-date-pickers` + `dayjs`            | Date inputs                 | `TextField type="date"`          | Optional, not installed     | Medium                               | Safe              |
| `@mui/x-tree-view`                         | Hierarchies                 | nested `List`                    | Optional, not installed     | Low                                  | Safe              |
| `@emotion/cache` + `stylis-plugin-rtl` 2.x | Full RTL flip of MUI styles | CSS logical properties (partial) | Optional, blocked on owner  | Low (~5 kB)                          | Safe              |

## Rejected

| Package                                                                                      | Reason                       | Use instead                               |
| -------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------- |
| framer-motion                                                                                | Animation library not needed | MUI transitions                           |
| apexcharts                                                                                   | Second chart engine          | `@mui/x-charts`                           |
| @iconify/react                                                                               | Second icon system           | `@mui/icons-material`                     |
| simplebar-react                                                                              | Custom scrollbars            | CSS `scrollbar-width`, `scrollbar-gutter` |
| sonner / notistack                                                                           | Second toast system          | MUI `Snackbar`                            |
| swr, axios                                                                                   | Duplicate data layer         | TanStack Query + `@azes/api`              |
| minimal-shared                                                                               | Third-party theme helpers    | AZES theme code                           |
| @mui/lab                                                                                     | Unstable components          | needs an ADR                              |
| Tailwind, Radix, shadcn, Chakra, Ant, Mantine, Bootstrap, styled-components, vanilla-extract | Second styling system        | MUI                                       |

## Rules for adding a dependency

1. Show the gap: why MUI, MUI X or the existing repo cannot do it.
2. Add a row to this matrix with bundle and maintenance impact.
3. Add it to the narrowest package or subpath that needs it.
4. Pin MUI-family versions consistently.
5. Libraries in the rejected list fail `pnpm architecture:verify` (`forbidden-libraries`).
