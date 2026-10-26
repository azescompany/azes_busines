/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/accessibility.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-02
 * ║ Purpose: Accessibility showcase for focus, contrast and semantics
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  Alert,
  AlertTitle,
  List,
  ListItemButton,
  ListItemText,
  MuiButton,
  TextField,
  Typography,
} from '@azes/ui-web';

import { SectionIntro } from './shared.js';

export function AccessibilitySection() {
  return (
    <SectionIntro title="Exposes Phase 11 behavior — no axe-core dependency.">
      <MuiButton variant="contained">Focus me</MuiButton>
      <TextField label="Keyboard focus field" helperText="Tab here to check the focus ring" />
      <List sx={{ maxWidth: 360 }}>
        <ListItemButton>
          <ListItemText primary="List item focus" secondary="Uses the primary focus ring" />
        </ListItemButton>
      </List>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Status is not color-only — Alerts keep icons and titles.
      </Alert>
      <Typography>
        Keyboard focus uses a ring mixed from the current primary. Contrast text is generated with
        MUI getContrastText. Use Skip to content, then Tab through AppBar, drawer, and main. Compact
        controls stay at least 24px tall. See docs/styles/12-accessibility.md.
      </Typography>
    </SectionIntro>
  );
}
