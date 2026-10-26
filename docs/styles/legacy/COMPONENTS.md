<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/COMPONENTS.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: MUI 9.3.1 component inventory, adoption decisions and customization rules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Components

This inventory was checked against the installed `@mui/material` 9.3.1 folders.

The **Status** column means:

- **now**: already re-exported from `@azes/ui-web` (`catalog.ts`).
- **P#**: the roadmap phase that adds theme overrides and the re-export.
- **later**: adopt when a product asks for it.
- **skip**: do not adopt.

## How components reach apps

1. Apps import from `@azes/ui-web` only. A component becomes available by adding a **named
   re-export** in `catalog.ts`. Never use `export *`.
2. Theme customization goes in `theme.components.Mui<Name>`.
3. An AZES component exists only when it adds behavior or a constrained API that MUI props
   cannot express. Today that is `Box`, `Stack`, `Text` and `Button`. No new AZES components
   are planned.

## Inputs

| Component                                                                                | Status   | Theme work                                                                               |
| ---------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| Button, ButtonBase                                                                       | now      | Overridden: radius, sizes, focus ring. P4 adds `disableElevation` and the density sizes. |
| IconButton                                                                               | now      | P4: size per density, focus ring                                                         |
| ButtonGroup                                                                              | P4       | Inherits Button                                                                          |
| ToggleButton, ToggleButtonGroup                                                          | now / P7 | Selected state uses primary                                                              |
| Fab                                                                                      | later    | Rare in AZES products                                                                    |
| TextField, OutlinedInput, InputLabel, FormHelperText, InputAdornment                     | now / P7 | Outlined default, radius, density size, error and focus colors                           |
| FilledInput, Input (standard)                                                            | skip     | One input style (outlined) across products                                               |
| Select, MenuItem, NativeSelect                                                           | now / P7 | NativeSelect: later                                                                      |
| Autocomplete                                                                             | now / P7 | Popper `zIndex.modal`, option density                                                    |
| Checkbox, Radio, RadioGroup, Switch, FormControlLabel, FormGroup, FormLabel, FormControl | now / P7 | Color primary, focus ring, density                                                       |
| Slider                                                                                   | now / P7 | Primary track                                                                            |
| Rating                                                                                   | later    |                                                                                          |
| TextareaAutosize                                                                         | now / P7 | Through TextField `multiline`                                                            |

## Data display

| Component                                                                                                      | Status   | Theme work                                                        |
| -------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| Typography                                                                                                     | now      | Variants in theme (see TYPOGRAPHY.md)                             |
| Avatar, AvatarGroup                                                                                            | now / P9 | Radius md, fallback colors from secondary                         |
| Badge                                                                                                          | now / P9 | Uses `error` for counts                                           |
| Chip                                                                                                           | now / P4 | Radius `full`, outlined default for filters                       |
| Divider                                                                                                        | now      | `divider` color                                                   |
| List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListItemAvatar, ListSubheader                      | now / P9 | Selected and hover from primary via `color-mix`, dense by density |
| Table, TableHead, TableBody, TableRow, TableCell, TableContainer, TableFooter, TablePagination, TableSortLabel | now / P9 | Header weight, borders, size by density; scroll below `md`        |
| Tooltip                                                                                                        | now / P8 | Inverse surface, enter/leave delay defaults                       |
| SvgIcon, Icon                                                                                                  | P4       | Sizes from `iconSm..Lg`                                           |
| ImageList                                                                                                      | later    |                                                                   |

## Feedback

| Component                                                            | Status   | Theme work                                              |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| Alert, AlertTitle                                                    | now / P8 | Standard variant default, radius, feedback colors       |
| Snackbar, SnackbarContent                                            | now / P8 | Position default bottom-center, toast z-index           |
| Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions | now / P8 | Radius lg, padding scale; fullScreen below `sm` in apps |
| CircularProgress, LinearProgress                                     | now / P8 | Primary color                                           |
| Skeleton                                                             | now / P8 | `wave` animation off when reduced motion is on          |
| Backdrop                                                             | now / P8 | Overlay scrim via `color-mix` on common.black           |

## Surfaces

| Component                                                             | Status   | Theme work                                      |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| Paper                                                                 | now / P4 | Elevation ladder, `outlined` variant border     |
| Card, CardContent, CardHeader, CardActions, CardMedia, CardActionArea | now / P4 | Outlined by default, radius lg                  |
| Accordion and its parts                                               | now / P9 | Border instead of shadow, no `::before` divider |
| AppBar, Toolbar                                                       | now / P6 | See NAVIGATION.md                               |

## Navigation

| Component                            | Status   | Theme work                                     |
| ------------------------------------ | -------- | ---------------------------------------------- |
| Drawer, SwipeableDrawer              | now / P6 | Paper border, widths; SwipeableDrawer later    |
| Tabs, Tab, TabScrollButton           | now / P6 | Indicator primary, no uppercase                |
| Breadcrumbs, Link                    | P6       | Link color `text.link`, underline on hover     |
| Menu, MenuList, Popover, Popper      | now / P8 | Radius, border; Menu/Popover use modal z-index |
| Pagination, PaginationItem           | now / P9 | Size by density; color primary                 |
| Stepper and its parts, MobileStepper | later    |                                                |
| BottomNavigation                     | later    | Mobile web only                                |
| SpeedDial                            | skip     |                                                |

## Layout and utilities

| Component                                                   | Status            | Notes                                                      |
| ----------------------------------------------------------- | ----------------- | ---------------------------------------------------------- |
| Box, Stack, Grid, Container                                 | now / P5          | Container added in P5                                      |
| CssBaseline, GlobalStyles, ScopedCssBaseline                | now (CssBaseline) | GlobalStyles only inside ui-web; ScopedCssBaseline skip    |
| Modal, Portal, ClickAwayListener, NoSsr, Unstable_TrapFocus | later             | Used through Dialog/Menu, not directly                     |
| Collapse, Fade, Grow, Slide, Zoom                           | now / P8          | Durations from theme transitions; Collapse `timeout: auto` |
| useMediaQuery, useScrollTrigger, useColorScheme, useTheme   | now / P6          | `useScrollTrigger` for sticky/elevate AppBar               |
| Pigment* (Container, Grid, Stack)                           | skip              | No Pigment CSS                                             |

## Outside `@mui/material`

- `@mui/icons-material`: showcase only today. Products get icons through `SvgIcon` from
  `@azes/ui-web` plus app-local SVGs, or a future curated named re-export when a product needs a
  shared set. Deep `@mui/icons-material/*` imports stay limited to the showcase (ESLint).
- MUI X (DataGrid, Date Pickers, Charts, Tree View) and `@mui/lab`: not adopted. Each needs an
  ADR (licensing, bundle size, theming).
