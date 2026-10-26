<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-018-pages-and-features.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: ADR for thin pages + feature modules + Query/RHF standards
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-018: Thin pages and feature modules

## Status

Accepted (2026-10-10).

## Context

Admin Users and Ads grew into fat “page” files mixing routing, Query, forms, and table UI.
Agents and developers needed a single, copyable structure so every new screen stays
consistent and testable.

## Decision

1. **Thin pages** under `pages/<feature>/index.tsx` — only render a feature `*View`.
2. **Feature modules** under `features/<feature>/` own components, columns, hooks,
   `service/*Api` + `service/*Queries`, and `models` (types, zod schema, mappers).
3. **Server state** = TanStack Query only; **Redux** only for genuine client/UI state.
4. **Forms** = react-hook-form + zod; validation messages are i18n keys.
5. **UI** = `AzesTable`, `AzesAccordion`, `useAzesDialog`, `AzesCarousel` from `@azes/ui-web`.
6. Governance: `.cursor/rules/page-architecture.mdc` + ESLint import restrictions in
   `apps/admin/eslint.config.js`.

## Consequences

- New screens copy Users/Ads layout.
- Cross-feature reuse goes through `shared/` or a public feature export — never deep imports.
- Remaining admin menus migrate incrementally (listed in `pages-and-features.md`).
