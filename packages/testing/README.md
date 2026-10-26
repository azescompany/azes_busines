<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/testing/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Overview of @azes/testing shared helpers
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/testing`

Shared test utilities for the AZES monorepo.

```ts
import { coverageThresholds } from '@azes/testing';
import { renderWithProviders, screen } from '@azes/testing/web';
import { renderNative, screen as nativeScreen, fireEvent } from '@azes/testing/native';
```

## Native notes

`@azes/testing/native` exposes an RNTL-shaped API for Vitest. Full
`@testing-library/react-native` cannot run under Node/Vitest because real
`react-native` ships Flow syntax. Keep RNTL installed for Metro/Jest runners;
use `@azes/testing/native` for package unit/component tests in this monorepo.
