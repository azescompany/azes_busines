<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-014-forms.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for react-hook-form bound fields in ui-web/forms
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-014: Forms with react-hook-form; schemas stay in apps

## Status

Accepted (2026-10-04).

## Context

Forms need consistent error display, validation timing and accessibility. The repo already
uses zod 3.25 in `@azes/validation`.

## Options

1. Plain controlled MUI fields per app.
2. Formik (heavier, re-renders the whole form).
3. `react-hook-form` bindings in `@azes/ui-web/forms`; apps bring resolvers and schemas.

## Decision

Option 3. `AzesForm`, `AzesFormTextField`, `AzesFormSection`, `AzesFormActions`, plus re-exported
`useForm`. Apps use `@hookform/resolvers/zod` with schemas from `@azes/validation`. ui-web has
no zod dependency.

## Consequences

- One accessible error pattern (`aria-invalid`, `aria-describedby`, error summary, focus first
  error).
- Additional bound inputs are added only when a second use appears.
