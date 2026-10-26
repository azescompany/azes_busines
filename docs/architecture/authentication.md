<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/authentication.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Authentication abstraction and platform adapters
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Authentication

`packages/auth` provides platform-agnostic auth **contracts** plus platform-specific **adapters**.
Applications depend on the contracts, never on a concrete provider implementation.

## Shared contracts (platform-independent)

- Session model, token model, and an `AuthAdapter` interface (`getToken`, `setSession`,
  `clearSession`, `refresh`, `onExpire`).
- Auth state exposed to apps through hooks/selectors coordinated with `@azes/state`.

## Web adapter

- Cookies/session where appropriate; browser storage for non-sensitive state.
- Redirect-based flows.
- Next.js: respect server/client boundaries; read session on the server where possible.

## Native adapter

- Secure storage (Keychain/Keystore) for tokens.
- Refresh-token lifecycle handling.
- Deep links for auth callbacks.
- App lifecycle awareness (foreground/background) for token refresh.

## Integration with API

- The API HTTP client obtains the access token via the auth adapter and injects it.
- On 401/expiry, the client triggers the adapter's refresh flow, then retries once.

## Security notes

- Never persist tokens in plain Redux state; use the secure adapter.
- See [security.md](security.md) for token handling, XSS/CSRF, and storage rules.
