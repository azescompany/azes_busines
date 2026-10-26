<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/LAYOUT.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Spacing, density presets, containers and grid conventions
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Layout

## Spacing

- `spacing: 4` is the only web spacing API. `theme.spacing(4)` gives 16px, emitted as
  `calc(4 * var(--mui-spacing, 4px))`. In `sx`, `p: 4` means 16px.
- `spacingScale` in `ui-web` maps a token key to MUI units for the AZES `Box` and `Stack`
  props. It is a translation layer, not a second scale.
- Allowed steps in product code: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16. Anything else
  needs a reason.

## Density presets (Phase 3)

Density is a theme input, not a spacing change.

| Setting                          | `comfortable` (default, today) | `compact`                          |
| -------------------------------- | ------------------------------ | ---------------------------------- |
| Button heights sm/md/lg          | 32 / 40 / 48 (`controlSm..Lg`) | 28 / 32 / 40                       |
| TextField / Select `size`        | `medium`                       | `small`                            |
| FormControl / TextField `margin` | `none`                         | `dense`                            |
| List / MenuItem `dense`          | `false`                        | `true`                             |
| Table `size`                     | `medium`                       | `small`                            |
| Toolbar min-height               | MUI default                    | `variant="dense"` via defaultProps |
| IconButton `size`                | `medium`                       | `small`                            |

- Compact control heights need new primitives (`controlXs: 28`) in `design-tokens`. This is
  added in Phase 3 together with a native review, because the tokens are shared.
- Only `defaultProps` change, so an explicit `size` prop on a component still wins.
- Touch targets in compact mode stay at least 24×24 CSS px (WCAG 2.2 target size, minimum).

## Containers

- Use MUI `Container` with `maxWidth` from the breakpoints (`sm` to `xl`). Token `containerSm`
  to `containerXl` equal the breakpoint widths, so no custom container is needed.
- Page padding: `px: { xs: 4, md: 6 }` (16 and 24px). This is documented, not enforced.

## Grid and Stack

- `Grid` (v9, `size` prop) for two-dimensional page layout. `Stack` or the AZES `Stack` for
  one-dimensional flow.
- Do not nest `Grid` more than two levels deep. Extract a component instead.
- Pigment variants (`PigmentGrid`, `PigmentStack`, `PigmentContainer`) are not used. There is
  no Pigment CSS (see ROADMAP not-to-build).

## App shell (Phase 5)

**Decision:** do **not** add `AppShell` to `@azes/ui-web` yet. Only the showcase uses a shared
shell pattern today. A thin `AppShell` moves into `ui-web` only when **two product apps** need
the same layout and it still carries no routing or auth.

### Recipe (showcase / product apps)

```tsx
<Box sx={{ display: 'flex', minHeight: '100vh' }}>
  <AppBar
    position="fixed"
    color="default"
    elevation={0}
    sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
  >
    <Toolbar>{/* brand, actions */}</Toolbar>
  </AppBar>
  <Drawer variant={desktop ? 'permanent' : 'temporary'} /* width 260 */>
    <Toolbar />
    {/* nav */}
  </Drawer>
  <Box component="main" sx={{ flexGrow: 1, px: { xs: 4, md: 6 }, py: 3 }}>
    <Toolbar /> {/* spacer for fixed AppBar */}
    <Container maxWidth="lg" disableGutters>
      {children}
    </Container>
  </Box>
</Box>
```

- Breakpoint for permanent vs temporary drawer: `lg` (1024) unless a product documents another.
- Page padding: `px: { xs: 4, md: 6 }` (16px / 24px).
- See [NAVIGATION.md](NAVIGATION.md) for AppBar and Drawer modes (Phase 6 expands those demos).
