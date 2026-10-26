<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: packages/auth/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Overview of @azes/auth contracts and adapters
║ Layer: package
╚══════════════════════════════════════════════════════════════╝
-->

# `@azes/auth`

Platform-agnostic auth **contracts** + web/native **adapters**. Backend authentication remains
authoritative. This package does not invent login APIs or UI.

## Public import

```ts
import {
  createWebAuthAdapter,
  createNativeAuthAdapter,
  createAuthClient,
  connectAuthToApi,
  AuthProvider,
  useAuthSession,
} from '@azes/auth';
import {
  setAccessTokenGetter,
  clearAccessTokenGetter,
  setAccessTokenRefreshHandler,
} from '@azes/api';

const adapter = createWebAuthAdapter();
const client = createAuthClient(adapter);
connectAuthToApi(client, {
  setAccessTokenGetter,
  clearAccessTokenGetter,
  setAccessTokenRefreshHandler,
});
```

## Security

- Do not put access/refresh tokens in Redux or `localStorage` (web adapter keeps them in memory).
- Native: inject a real `AuthSecureStorage` (Keychain/Keystore). `createMemorySecureStorage` is
  for tests only.
- Never log token values.
