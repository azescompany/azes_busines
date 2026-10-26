<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/development/contribution-guide.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Contribution standards, naming, headers, and quality gates
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Contribution Guide

## Before you start

- Read WWORKER.mdW, W.cursor/rules/*.mdcW, and the relevant Wdocs/architecture/*W.
- Confirm the active phase and that your change is in scope.

## Naming conventions

- Packages: W@azes/<kebab-name>W.
- Apps: kebab-case directories matching the target list.
- Components WPascalCase.tsxW; hooks WuseX.tsW; utils WcamelCase.tsW; tests W*.test.ts(x)W.
- Types/interfaces/enums WPascalCaseW; constants WUPPER_SNAKE_CASEW.

## File headers

- Every comment-supporting file starts with the AZES header (see
  [../architecture/overview.md](../architecture/overview.md) and W.cursor/rules/comment-header.mdcW).
- WCreatedW set once; update WUpdatedW on meaningful edits.
- Do not break machine-readable files (strict JSON has no header).

## Quality gates (must pass for the phase's scope)

- Typecheck, ESLint (incl. boundaries), Prettier check, tests, build, and OpenAPI drift (Phase 6+).

## Do / Don't

- Do keep changes small and phase-scoped.
- Do add tests and headers.
- Don't introduce premature abstractions or unneeded dependencies.
- Don't edit generated files.
- Don't modify unrelated files.
