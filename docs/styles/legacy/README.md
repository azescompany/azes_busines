<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/legacy/README.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Banner for the frozen Styles track v1 documentation
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Legacy styles docs (frozen)

These files are the Styles track v1 documentation (Styles Phases 0–15, written 2026-10-02 to
2026-10-04). They were moved here with `git mv`, so `git log --follow` shows their history.

- **Frozen.** Do not edit or add files here. `pnpm architecture:verify` fails if a file that is
  not in the frozen list appears in this folder.
- **Superseded** by the numbered set in [`docs/styles/`](../README.md) and by ADR-010 to ADR-016.
- Some decisions here were reversed on purpose: "no AppShell in ui-web", "navigation is
  recipes, not components", "Theme Lab state stays in azes-ui" and "no curated icon barrel".
  [17-migration.md](../17-migration.md) lists each one with the reason.
- `CROSS-APP.md` and `BASELINE.md` stay here as dated evidence.

The original index of this folder is [INDEX-v1.md](INDEX-v1.md).
