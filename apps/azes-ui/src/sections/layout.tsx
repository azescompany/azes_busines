/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/layout.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-04
 * ║ Purpose: Layout, app-shell and responsive showcase sections
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Container, Grid, MuiBox, Paper, Stack, Typography } from '@azes/ui-web';

import { SectionIntro, StackText } from './shared.js';

export function LayoutSection() {
  return (
    <SectionIntro title="Container for page width, Grid for two axes, Stack for one axis.">
      <Container maxWidth="lg" disableGutters>
        <Stack gap={4}>
          <Typography variant="body1">
            Page padding belongs on the shell main area:{' '}
            <Typography component="code" variant="body2">
              px: {'{ xs: 4, md: 6 }'}
            </Typography>
            .
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                Column 1
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                Column 2
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                Column 3
              </Paper>
            </Grid>
          </Grid>
          <Stack direction="row" gap={2}>
            <Paper sx={{ p: 2, flex: 1 }} variant="outlined">
              <Typography variant="body2">Stack item A</Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }} variant="outlined">
              <Typography variant="body2">Stack item B</Typography>
            </Paper>
          </Stack>
        </Stack>
      </Container>
    </SectionIntro>
  );
}

export function AppShellSection() {
  return (
    <StackText>
      <Typography variant="body1">
        This showcase runs on{' '}
        <Typography component="code" variant="body2">
          AzesDashboardLayout
        </Typography>{' '}
        from{' '}
        <Typography component="code" variant="body2">
          @azes/ui-web/layout
        </Typography>
        : sticky header, vertical, mini or horizontal navigation from{' '}
        <Typography component="code" variant="body2">
          lg
        </Typography>
        , a mobile drawer below that, and a main region with the skip-link target.
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
        {`┌────────────┬────────────────────────────────┐
│ Logo       │ Header: start · center · end   │
├────────────┼────────────────────────────────┤
│ Nav        │                                │
│ (vertical  │   Main (#main-content)         │
│  or mini)  │                                │
│            ├────────────────────────────────┤
│            │ Footer                         │
└────────────┴────────────────────────────────┘`}
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Sizing
        </Typography>
        <Typography variant="body2">
          Sizes come from layout tokens through --azes-layout-* CSS variables (header height, nav
          width, content max width, page padding). Apps never hard-code shell sizes.
        </Typography>
      </Paper>
    </StackText>
  );
}

export function ResponsiveSection() {
  return (
    <SectionIntro title="Use theme breakpoint keys only. Prefer sx breakpoint objects over useMediaQuery.">
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Breakpoints (px)
        </Typography>
        <Typography variant="body2">sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          The header Viewport picker frames section content at 360 / 768 / 1024 / 1440. Dialogs
          fullScreen below sm. Tables scroll in TableContainer below md.
        </Typography>
      </Paper>
      <MuiBox
        sx={{
          display: { xs: 'block', md: 'none' },
          p: 2,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        Visible below md via sx breakpoints
      </MuiBox>
      <MuiBox
        sx={{
          display: { xs: 'none', md: 'block' },
          p: 2,
          borderRadius: 1,
          bgcolor: 'action.selected',
        }}
      >
        Visible from md via sx breakpoints
      </MuiBox>
    </SectionIntro>
  );
}
