<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/ui-native/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Usage guide for @azes/ui-native
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/ui-native`

AZES React Native design system. Consumes `@azes/design-tokens` via StyleSheet values.
Independent from `@azes/ui-web`.

## Starter set (Phase 5)

- `ThemeProvider` / `useTheme`
- `Box`
- `Stack`
- `Text`
- `Button`

## Usage

```tsx
import { ThemeProvider, Stack, Text, Button } from '@azes/ui-native';

export function Screen() {
  return (
    <ThemeProvider theme="light">
      <Stack gap={4} p={4}>
        <Text size="xl" weight="semibold">
          AZES
        </Text>
        <Button onPress={() => undefined}>Continue</Button>
      </Stack>
    </ThemeProvider>
  );
}
```

## Rules

- Import only from `@azes/ui-native` (no deep imports).
- Do not depend on `@azes/ui-web`.
- Do not put API/state/auth/business logic in this package.
