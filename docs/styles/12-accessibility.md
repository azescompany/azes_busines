<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/12-accessibility.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Accessibility requirements per component family and how each is verified
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Accessibility

Target: WCAG 2.2 AA in both color schemes and both densities. Accessibility is a release
requirement, not polish.

## Requirements and verification

| Area           | Requirement                                                                                             | Verified by                                           |
| -------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Contrast       | Text 4.5:1; large text and UI parts 3:1; every seed and accepted custom hex in light and dark           | unit tests (`getContrastRatio`) in theme and settings |
| Focus          | Visible ring on every interactive element (`:focus-visible`, primary `color-mix` 35%)                   | theme tests; keyboard pass in visual QA               |
| Keyboard       | All controls reachable; nav lists, menus, tabs use arrow keys where MUI provides them                   | Testing Library `user-event` tab/arrow tests          |
| Drawers        | Mobile nav and settings drawer trap focus and return it to the trigger                                  | component tests (focus returns to button)             |
| Dialogs        | Labelled by title; `Escape` closes; focus returns                                                       | showcase test                                         |
| Menus/popovers | Opened from buttons with `aria-haspopup`, `aria-expanded`                                               | nav renderer tests                                    |
| Tooltips       | Never the only label; icon-only buttons have `aria-label`                                               | role/name queries                                     |
| Navigation     | `<nav aria-label>` landmark; active item `aria-current="page"`; mini items keep names                   | nav tests                                             |
| Skip link      | "Skip to content" targets `AzesMainContent` (`id="main-content"`)                                       | showcase test                                         |
| Forms          | Every field labelled; errors linked with `aria-describedby`; `aria-invalid`; errors announced on submit | form tests                                            |
| Data grid      | MUI X grid roles kept; toolbar buttons labelled; `aria-label` on grid                                   | data grid test                                        |
| Charts         | `title`/`desc` and a visible summary or table alternative                                               | chart test                                            |
| Reduced motion | `prefers-reduced-motion: reduce` shortens transitions; scroll effects off                               | `CssBaseline` rule + manual check                     |
| Target size    | ≥ 24×24px compact, ≥ 40px comfortable                                                                   | theme test                                            |
| Color          | Status never by color alone (icons, text)                                                               | review                                                |
| RTL            | Logical CSS properties; direction attribute on `<html>`                                                 | code review; visual QA when RTL is approved           |

## Manual checklist (per release)

- [ ] Keyboard-only pass of the showcase in light and dark.
- [ ] 200% zoom pass.
- [ ] Screen reader pass (NVDA on Windows) of nav, settings drawer, a form and a dialog.
- [ ] axe browser extension: no serious or critical issues on Overview, Forms, Data grid.

Automated axe (`@axe-core/playwright`) was declined in v1 and remains an open owner decision.
