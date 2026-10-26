<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/03-color-system.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: Brand seed versus stable semantic colors
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Color system

`primary.main` is the runtime seed. `primary.light`, `primary.dark`, and
`primary.contrastText` come from MUI `augmentColor` / `getContrastText`.

When the seed changes:

- Changes: primary palette and the focus ring mixed from primary.
- Stays: `secondary` (`action.secondary` navy), `success`, `warning`, `error` (`feedback.danger`),
  and `info`.

That split matches `packages/design-tokens/src/semantic/color.ts`, which already separates
brand action from feedback and from navy secondary.

There is no purple primitive. Named seeds are only the existing scales: teal, navy, green,
amber, and red.

Link color stays `foreground.link` and does not follow the primary seed.
