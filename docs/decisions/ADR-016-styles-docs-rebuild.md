<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-016-styles-docs-rebuild.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Decision record for rebuilding docs/styles in place with a frozen legacy folder
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-016: Rebuild `docs/styles` in place; freeze v1 under `legacy/`

## Status

Accepted (2026-10-04).

## Context

`docs/styles/` held the Styles track v1 docs, some of whose decisions are now superseded. The
new architecture needs one coherent documentation set.

## Options

1. Append to the v1 files.
2. Move v1 out of `docs/styles` to a separate archive folder.
3. `git mv` v1 into `docs/styles/legacy/` and write a numbered set in `docs/styles/`.

## Decision

Option 3. `legacy/` is frozen. The audit check `styles-docs` fails when a numbered file is
missing, when an unknown file appears in `legacy/`, or when a misspelled styles folder name is
referenced anywhere in the repo.

## Consequences

- History is preserved (`git log --follow`).
- Readers find one current set; v1 stays as evidence.
