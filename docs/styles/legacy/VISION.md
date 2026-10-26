<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/VISION.md
║ Author: AZES_COMPANY
║ Created: 2026-10-02
║ Updated: 2026-10-02
║ Purpose: Goals and non-goals of the AZES web design system
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Vision

The AZES web design system is **one MUI theme** that every web product shares. Products differ
by brand inputs (primary, optional secondary, density), not by forked styles.

## Goals

- Every web app gets correct light/dark, focus, typography and spacing from `AzesThemeProvider`
  with no app-level CSS.
- Brand changes are theme inputs. Changing primary recolors the product without touching
  components.
- Customization happens in `theme.components` (`defaultProps`, `styleOverrides`, `variants`),
  so component code stays plain MUI.
- `apps/azes-ui` shows every supported pattern and lets designers try theme inputs live.
- The system stays small. Anything added must be used by a product or the showcase.

## Non-goals

- Not a re-skin of every MUI component with `Azes*` names.
- Not a second token engine, spacing scale or color system next to MUI.
- Not a home for business components. Domain UI stays in each app's `features/`.
- Not a universal web plus native package. `ui-native` stays separate and token-driven.

## Principles

1. **Tokens are primitives, the theme is semantics.** Raw values come from
   `@azes/design-tokens`. Meaning (palette roles, variants, density) lives in the MUI theme.
2. **Configure before wrapping.** Use a theme override before a styled wrapper, and a styled
   wrapper before a new component.
3. **CSS variables first.** Theme values reach the DOM as `--mui-*` variables, so mode switches
   do not re-render the React tree.
4. **Demo state stays in the demo.** Theme Lab controls never ship in a product bundle.
