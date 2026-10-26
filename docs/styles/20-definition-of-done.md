<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/20-definition-of-done.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Checkable acceptance criteria for components, phases and releases
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Definition of done

## Every component

- [ ] The style hierarchy in 01 was followed; a wrapper meets a criterion in 07.
- [ ] Colors from `theme.vars`; sizes from tokens; logical CSS properties.
- [ ] Works in light and dark, comfortable and compact.
- [ ] Keyboard operable, visible focus, accessible name, correct role (12).
- [ ] Unit or component test.
- [ ] Demo in `azes-ui`.
- [ ] Exported from exactly one subpath `index.ts`; documented in its topic file.

## Every phase

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build` pass.
- [ ] `pnpm architecture:verify` passes, including `forbidden-libraries`, `ui-web-subpaths`,
      `layout-hardcoded-values` and `styles-docs`.
- [ ] `azes-ui` renders the new capability.
- [ ] Docs updated; gate recorded in `WORKER.md`.
- [ ] Product apps unchanged unless the phase says otherwise.

## Track release

- [ ] All files in the `docs/styles` index exist; `legacy/` unchanged.
- [ ] No references to retired folder names.
- [ ] Visual QA matrix (15) passes locally.
- [ ] Budgets in 16 met.
- [ ] Smoke tests for all web apps pass.
- [ ] Open owner decisions listed in `WORKER.md`.
