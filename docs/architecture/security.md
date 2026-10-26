<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/architecture/security.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Architecture-level security considerations and environment strategy
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Security & Environments

Security is documented here as a forward strategy. Nothing is implemented in the planning phase.

## Token handling

- Web: prefer HttpOnly cookies for session tokens where the backend supports it; otherwise keep
  access tokens in memory. Avoid localStorage for sensitive tokens.
- Native: store tokens in secure storage (Keychain/Keystore) via the auth adapter.
- Refresh tokens: rotated; never logged; handled by the auth adapter.

## Web threats

- XSS: rely on React escaping; never `dangerouslySetInnerHTML` without sanitization; strong CSP
  on Next.js where applicable.
- CSRF: prefer same-site cookies + CSRF tokens for cookie-based auth.

## Secrets & environment

- Environments: `development`, `staging`, `production`.
- Never hardcode or commit secrets. Use env files that are gitignored + secret managers in CI.
- Public vs private config:
  - Next.js: only `NEXT_PUBLIC_*` is exposed to the browser; everything else is server-only.
  - Vite: only `VITE_*` is exposed to the client bundle.
  - Expo: only `EXPO_PUBLIC_*` is exposed to the app; sensitive values via secure config/EAS.
- Build-time vs runtime variables documented per app in Phase 10.

## Dependencies

- Prefer minimal, well-maintained dependencies; audit in CI.
- Every significant dependency evaluated for bundle/runtime/maintenance/cross-platform impact.

## Logging & analytics privacy

- Never log tokens, passwords, or PII. `@azes/logger` scrubs known-sensitive fields.
- Analytics events avoid PII; consent handled at the app layer.

## Permissions

- Frontend permissions (`resource.action`) drive UX/navigation only. Backend authorization is
  authoritative.
