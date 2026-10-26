<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/11-migration-plan.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Ordered phases for the MUI web theme migration
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Migration plan

Work happens on `dev`, created from clean `main`. `docs/roadmap/phase-13-proposal.md` stays
an unapproved auth proposal.

| Phase | Goal                                                   | Apps touched                      |
| ----- | ------------------------------------------------------ | --------------------------------- |
| 0     | Create `dev`                                           | none                              |
| 1     | ADR-009 and this docs set                              | none                              |
| 2     | `createAzesTheme` beside the old provider              | none                              |
| 3     | CssBaseline inside `AzesThemeProvider`                 | none                              |
| 4     | `apps/azes-ui` showcase on port 5177                   | new demo only                     |
| 5     | Switch `account`                                       | account                           |
| 6     | Switch the other Vite shells                           | admin, agent-platform, agent-site |
| 7     | Next.js SSR cache, color-scheme script, cookie primary | realestate                        |
| 8     | Remove BEM CSS, old provider, Radix Slot               | all web, after they opt in        |
| 9     | typecheck, lint, test, architecture:verify             | none new                          |

Native apps are not in this list. Backend, auth, and API packages are not modified.

Rollback before an app opts in is reverting `dev`. After an app opts in, that app can be
pointed back at the old provider until phase 8 deletes it.
