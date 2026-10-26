<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/ui-web/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-09-29
║ Purpose: Usage guide for @azes/ui-web
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/ui-web`

AZES web design system. Design tokens stay in `@azes/design-tokens`. This package maps them
onto Material UI v9 (`createAzesTheme`, `AzesThemeProvider`, `CssBaseline`).

Applications import this package. They do not import `@mui/material` components.
See [ADR-009](../../docs/decisions/ADR-009-mui-web-theme.md).

## Usage

```tsx
import { AzesThemeProvider, Stack, Text, Button } from '@azes/ui-web';

export function Example() {
  return (
    <AzesThemeProvider>
      <Stack gap={4}>
        <Text as="h1" size="2xl" weight="bold">
          AZES
        </Text>
        <Button variant="primary">Continue</Button>
      </Stack>
    </AzesThemeProvider>
  );
}
```

`AzesThemeProvider` defaults the primary color to teal `#167764` and the color mode to
`system`. Pass `primary` to override the brand seed.

## Boundaries

Allowed: `@azes/design-tokens`, React, `@mui/material`, Emotion.
Forbidden: `@mui/material-nextjs`, api, state, auth, business domains.
Native UI stays in `@azes/ui-native`.
