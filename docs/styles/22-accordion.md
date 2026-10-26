<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/22-accordion.md
║ Author: AZES_COMPANY
║ Created: 2026-10-09
║ Updated: 2026-10-09
║ Purpose: AzesAccordion API, behavior, tokens and when-to-use guidance
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesAccordion

Global panel above tables for **search/filter** and **create/edit** forms. Lives in
`@azes/ui-web` core (`AzesAccordion`, `AzesFormGrid`, `AzesConfirmDialog`).

## Modes (discriminated union)

| Mode     | Required extras                                    | Footer               |
| -------- | -------------------------------------------------- | -------------------- |
| `search` | `onSubmit`, `onReset`, `submitLabel`, `resetLabel` | Reset + Search       |
| `crud`   | `intent`, `onSubmit`, `onCancel`                   | Cancel + Save/Create |

Shared: `title`, `subtitle?`, `icon?`, controlled/uncontrolled `open`, `children`,
`headerActions?`, `loading?`, `error?`, `sx`.

## Behavior

- Collapse keeps children mounted (search draft values survive close). Remount CRUD forms
  with a React `key` when switching edit rows if needed.
- `prefers-reduced-motion`: collapse timeout `0`, scroll `behavior: 'auto'`.
- Focus: on open → first field; on close (user) → header button. Esc closes CRUD (dirty guard).
- Search: active filter chips remain when collapsed; chip `onRemove` clears one filter.
- CRUD dirty: closing / cancel / Esc opens `AzesConfirmDialog` when `isDirty`.
- When CRUD opens from a page toolbar, close the search panel (page responsibility).
- Edit row highlight: pass `highlightedRowId` to `AzesTable` (same selected tint).

## Tokens

`theme.azes.accordion`: `headerMinHeight`, `headerHoverMixPercent`, `chipMixPercent`,
`contentPaddingBlock`, `contentPaddingInline` (density-aware). Styles via
`accordionStyles.ts` (`getAccordionSx`, …). No hardcoded hex/px in components.

## Form grid

`AzesFormGrid` — responsive `1 | 2 | 3 | 4` columns (mobile 1, tablet ≤2, desktop `columns`).

## When accordion vs drawer/dialog

| Use accordion                                   | Prefer drawer/dialog                        |
| ----------------------------------------------- | ------------------------------------------- |
| Table filter bar; short create/edit (≲8 fields) | Long wizards, 10+ fields, media-heavy flows |
| Keep context of the grid visible                | Full-screen or multi-step                   |

## Example (Users pattern)

```tsx
<AzesAccordion mode="search" title={t('users.filters.title')} …>
  <AzesFormGrid columns={3}>{/* filter fields */}</AzesFormGrid>
</AzesAccordion>

<AzesAccordion mode="crud" intent={intent} open={crudOpen} isDirty={dirty} …>
  <UserForm … />
</AzesAccordion>

<AzesTable highlightedRowId={editId} … />
```

## A11y

Header button: `aria-expanded`, `aria-controls`. Panel: `role="region"`, `aria-labelledby`.
`focus-visible` uses `border.focus`.
