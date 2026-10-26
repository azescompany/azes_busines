<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/migration/10-azes-ui-demo.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-09-29
║ Purpose: What the design-system showcase shows
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# azes-ui showcase

`apps/azes-ui` (`@azes/azes-ui`) is a Vite app on port 5177.

```bash
pnpm --filter @azes/azes-ui dev
```

The shell is an app bar, a left navigation drawer (permanent from the `lg` breakpoint,
temporary below it), a main section, and a right summary of the live primary and contrast
text on large screens.

Sections cover foundations (color, type, spacing, radius, shadow), components (buttons,
inputs, forms, cards, dialogs, alerts, snackbar, tables), navigation, and accessibility.

The toolbar changes the primary seed (teal, navy, green, amber, red, or a custom hex) and
the mode (light, dark, system). The theme updates without a reload.
