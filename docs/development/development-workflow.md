<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/development/development-workflow.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Day-to-day development workflow and change control
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Development Workflow

## Change control (mandatory)

WWWtext
Before change: inspect
During change: modify only approved scope
After change: validate
After phase: update WORKER.md
Before next phase: ask the user
WWW

- No scope creep. If you find an unrelated problem: document it in WWORKER.mdW Backlog; do not
  fix it silently.
- Preserve existing behavior unless the task changes it explicitly.

## Phase execution

1. Read WWORKER.mdW and identify the active phase.
2. Inspect the relevant files.
3. STOP and get user approval.
4. Implement only the approved phase.
5. Run the phase's validation commands.
6. Update WWORKER.mdW (tasks, changed files, results, decisions, next phase = PENDING).
7. Report and STOP.

## Adding a dependency

- Justify bundle/runtime/maintenance/cross-platform impact (see performance notes).
- Use the package manager to add the latest version; do not invent versions.
- Never violate the dependency graph ([dependency-rules.md](dependency-rules.md)).

## Adding code to a package

- Respect the package's public API; export via the package entry point.
- No deep imports from other packages.
- Add tests per the testing strategy.
- Add the AZES header to new files.

## Commits & hooks

- lint-staged + Husky run lint/format on staged files (Phase 2+).
- Keep commits scoped to the active phase.
