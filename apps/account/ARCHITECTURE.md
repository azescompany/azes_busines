<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/account/ARCHITECTURE.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Behavioral auth reference notes for future account features
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# Authentication & Authorization Architecture

**Application:** Caspian Key (housekey)  
**Stack:** React 18 + Vite + TypeScript, Redux Toolkit, React Query, React Router 6, Axios, `js-cookie`, `jwt-decode`  
**Purpose:** Behavioral reference for rebuilding auth/authorization in a new monorepo.  
**Scope:** Runtime authentication, authorization, tokens, device identity, roles, menus, routing, interceptors, session lifecycle.  
**Status labels:** **CONFIRMED** | **INFERRED** | **UNKNOWN**

---

## 1. System overview

This frontend uses **cookie-stored JWTs** (access + refresh), **Redux** for in-memory session/role flags, a **single Axios instance** with request/response interceptors, **server-driven menus**, and a **ProtectedRoute** that distinguishes Evaluation vs non-Evaluation route allowlists.

There is **no fine-grained frontend permission claim system**. Authorization UX is primarily:

1. JWT `RoleId` → Redux role flags
2. Backend-assigned menus → visible navigation
3. Hardcoded route allowlists (Evaluation vs default)
4. Scattered role-based UI conditionals

**BACKEND AUTHORIZATION CONTRACT — UNKNOWN** for actual API enforcement. Frontend route/menu protection is UX only unless the backend independently validates tokens, device, and roles.

---

## 2. Authentication system map (actual runtime)

```text
Application boot (main.tsx)
      ↓
Register Axios interceptors (side-effect import)
      ↓
Redux store created → initializeFromCookies()
      ├── accessToken cookie present → decode JWT → AUTHENTICATED flags
      └── no accessToken → UNAUTHENTICATED
      ↓
Router renders
      ├── Public: /accounts/login, /error, /payment-info, /lock, *
      └── Protected layout tree (/) → ProtectedRoute
            ├── cookies accessToken OR refreshToken? → allow auth gate
            ├── Evaluation RoleId? → evaluation allowlist
            └── else → default allowlist
      ↓
If authenticated layout mounts
      ↓
GET user menus (server) → sidebar/nav (hidden for Evaluation)
      ↓
API requests → Axios interceptor
      ├── Authorization: Bearer <accessToken cookie>
      ├── X-Device-Id / DeviceId headers
      └── POST/PUT/PATCH body enriched with device fields
      ↓
Backend response
      ├── 401 → refresh (single-flight) → retry OR logout
      ├── 403 → treat as other-device login → logout + message
      ├── 402 → redirect /payment-info
      └── other errors → snackbar
```

Evidence:

- `src/main.tsx`
- `src/pages/auth/login_with_device/slice.ts`
- `src/middleware/interceptor.ts`
- `src/router/index.tsx`
- `src/router/components/protectedRouter/index.tsx`

---

## 3. Login flow

### 3.1 Initiation — CONFIRMED

| Question              | Answer                                                |
| --------------------- | ----------------------------------------------------- |
| User action           | Submit login form at `/accounts/login`                |
| Credentials           | `userName` + `password`                               |
| Email/phone           | Not used as separate fields; identifier is `userName` |
| Tenant/org in request | Not sent on login                                     |
| Device ID             | Yes — required before submit                          |
| Extra metadata        | `userAgent`, `platform`, `language`                   |

On login page mount (before login):

1. Cookies `accessToken`, `refreshToken`, `token` are removed
2. Device localStorage keys are cleared
3. Device fingerprint is regenerated in memory via `useDeviceId`

**Why:** Login page always starts a clean client session. Visiting login while “logged in” clears local tokens.

Evidence:

- `src/pages/auth/login_with_device/index.tsx`
- `src/pages/auth/login_with_device/model.ts` (`ILoginRequest`)
- `src/hooks/useLocalStorage.ts` (`clearDeviceData`)

### 3.2 Login request contract — CONFIRMED

```text
Frontend sends
  userName
  password
  deviceId          (SHA-256 fingerprint)
  userAgent
  platform
  language
        ↓
Backend authenticates
        ↓
Backend returns
  accessToken
  refreshToken
```

Typed response shape is only `{ accessToken, refreshToken }`. No user object, roles, or permissions are returned as separate fields.

Evidence:

- `src/pages/auth/login_with_device/service.ts`
- `src/pages/auth/login_with_device/model.ts`
- `src/constants/endpoints.ts` → `AUTH.LOGIN = "/accounts/login"`

### 3.3 Post-login success — CONFIRMED

```text
LoginResponse
  ↓
Cookies written (accessToken, token=accessToken duplicate, refreshToken)
  ↓
Redux setCredentials(accessToken, refreshToken, deviceInfo)
  ↓
JWT decoded → user + RoleId flags
  ↓
setUserAuthenticated(true)
  ↓
setUserLogin(isSpecialUser(username))   // client-only flag
  ↓
Navigate Evaluation → /evaluation else → /dashboard
```

Special usernames (`admin`, `superadmin`, `moderator`) set `localStorage.isSpecialUser` only. This is **not** JWT-derived role detection.

Evidence:

- `src/pages/auth/login_with_device/utils/handleLoginSuccess .tsx`
- `src/pages/auth/login_with_device/slice.ts` (`setCredentials`)

### 3.4 Login failure — CONFIRMED

- Mutation error → snackbar (message from API if present, else credentials error)
- Loading cleared
- No tokens written (cookies may already have been cleared on page mount)

---

## 4. Device ID

### 4.1 Generation — CONFIRMED

Device ID is a **deterministic SHA-256 hex** of:

```text
navigator.userAgent + "|" + navigator.platform + "|" + navigator.language
```

Not a random UUID. Same browser fingerprint inputs → same ID.

Evidence: `src/pages/auth/login_with_device/utils/deviceUtils.tsx`

### 4.2 When / where — CONFIRMED

| Moment                          | Behavior                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Login page load                 | Generated in memory via `useDeviceId` / `getFullDeviceInfo`                        |
| First authenticated API request | Interceptor `getOrCreateDeviceId()` reads or creates `localStorage.app_device_id`  |
| Login submit                    | Sent in login body                                                                 |
| Every Axios request             | Sent as headers `X-Device-Id` and `DeviceId`                                       |
| POST/PUT/PATCH                  | Also injected into JSON body as `deviceId` (+ `userAgent`, `platform`, `language`) |

### 4.3 Persistence — CONFIRMED

| Storage      | Key                       | Purpose                        |
| ------------ | ------------------------- | ------------------------------ |
| localStorage | `app_device_id`           | Interceptor device id          |
| localStorage | `app_device_last_updated` | Timestamp when id created      |
| localStorage | `deviceInfo`              | Full device object after login |
| localStorage | `lastLoginDevice`         | deviceId string after login    |

Not stored in cookies/IndexedDB for the active path.

### 4.4 Lifecycle semantics — CONFIRMED / INFERRED

| Question                           | Answer                                                                                                                                                                                                     | Confidence |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Generated before login?            | Yes (login page)                                                                                                                                                                                           | CONFIRMED  |
| Generated on app startup always?   | Only when interceptor needs it / login page loads                                                                                                                                                          | CONFIRMED  |
| Survives refresh?                  | Yes if `app_device_id` remains                                                                                                                                                                             | CONFIRMED  |
| Survives browser restart?          | Yes (localStorage) while inputs unchanged                                                                                                                                                                  | CONFIRMED  |
| Changes after logout?              | Cleared on AppBar logout + login page mount; next call regenerates same hash if UA/platform/language unchanged                                                                                             | CONFIRMED  |
| Unique per user?                   | No — fingerprint of browser environment                                                                                                                                                                    | CONFIRMED  |
| Unique per installation?           | Effectively per browser profile/environment inputs                                                                                                                                                         | INFERRED   |
| Used on refresh-token call?        | Refresh uses raw `axios.post` **without** going through the instance request interceptor; device headers **not attached** on refresh request itself. Retry of original request re-attaches device headers. | CONFIRMED  |
| Backend device enforcement meaning |                                                                                                                                                                                                            | UNKNOWN    |

**INFERRED:** Login SHA-256 and interceptor `app_device_id` use the same algorithm/inputs, so they match for the same browser after regeneration.

### 4.5 Legacy / unused device systems — CONFIRMED present, INFERRED unused by boot

Parallel code exists (`src/middleware/deviceKey.ts`, `src/middleware/device/*`, `DeviceGuard`) using different keys (`app_device_key`, `authToken`) and is **not** imported from `main.tsx`. Treat as dead/legacy for migration unless revived.

Constants such as `MAX_DEVICES_PER_USER`, `VERIFY_DEVICE`, `ALLOW_MULTIPLE_DEVICES` in `login_with_device/constants.ts` are **not proven** as runtime-enforced by the active frontend path.

---

## 5. Auth data ownership

| Data              | Source                          |           Frontend derives? |                                           Persisted? | Used for                                 |
| ----------------- | ------------------------------- | --------------------------: | ---------------------------------------------------: | ---------------------------------------- |
| Access token      | Backend login/refresh           |                          No |           Cookie `accessToken` (+ duplicate `token`) | Bearer auth, JWT decode                  |
| Refresh token     | Backend login/refresh           |                          No |                                Cookie `refreshToken` | 401 refresh                              |
| User id / name    | JWT claims `UserId`, `FullName` |                Yes (decode) | In Redux memory; reconstructed from cookie on reload | UI identity                              |
| Role flags        | JWT claim `RoleId`              |                         Yes |                    Redux (+ reconstructed on reload) | Routes/UI                                |
| Role name string  | JWT claim `role`                | Yes (via `useDecodedToken`) |                             Not separately persisted | Alternate role checks / display          |
| OrganizationId    | JWT claim                       |                         Yes |                             Not separately persisted | e.g. non–SuperAdmin user create defaults |
| Device ID         | Frontend fingerprint            |                         Yes |                                         localStorage | Login body, request headers/body         |
| DeviceInfo object | Frontend                        |                         Yes |                            localStorage `deviceInfo` | Session metadata                         |
| Menus             | Backend `GET /menus/user-menu`  |                          No |                                    React Query cache | Navigation                               |
| `isSpecialUser`   | Frontend username list          |                         Yes |                                         localStorage | Client-only flag                         |
| Permissions array | —                               |                           — |                                                    — | **Not present on frontend**              |

Cookie write options (active login/interceptor path):

- Access/`token`: expires **7** days, `secure: true`, `sameSite: "strict"`
- Refresh: expires **30** days, `secure: true`, `sameSite: "strict"`

These are **cookie lifetimes**, not proven JWT `exp` values.

Evidence: `src/pages/auth/login_with_device/service.ts`, `src/middleware/interceptor.ts`, `src/helpers/jwt.ts`

---

## 6. Token strategy

### 6.1 Token types — CONFIRMED

- Access token: JWT (decoded with `jwt-decode`)
- Refresh token: stored and sent to refresh endpoint; **frontend does not decode it** → opaque to the client
- Duplicate cookie `token` mirrors access token (compatibility)

### 6.2 Storage — CONFIRMED

| Location              | Contents                                     |
| --------------------- | -------------------------------------------- |
| Cookies (`js-cookie`) | Source of truth for HTTP transport tokens    |
| Redux `auth` slice    | Mirror for UI/session flags + decoded claims |
| Memory                | Axios refresh single-flight promise          |

**Not** httpOnly (JS can read cookies).  
**Not** primary localStorage token storage on active path (legacy `authToken` exists elsewhere).

### 6.3 Reload behavior — CONFIRMED

On Redux init, `initializeFromCookies()`:

1. Reads `accessToken` cookie
2. If missing → unauthenticated
3. If present → decode → set user + role flags + restore `deviceInfo` / `lastLoginDevice` from localStorage

ProtectedRoute separately checks cookie presence of `accessToken` **or** `refreshToken` (does not decode/validate `exp`).

### 6.4 Logout cleanup — CONFIRMED (active AppBar path)

`logout` reducer removes cookies `accessToken`, `refreshToken`, `token` and auth-related localStorage keys (`deviceInfo`, `lastLoginDevice`, `isAuthenticated`, `hash`, `isSpecialUser`). AppBar also calls `clearDeviceData()` (`app_device_id`, `app_device_last_updated`, …). Then hard redirect to `/accounts/login`.

**Note:** Active logout does **not** call `loginService.logout()` / backend logout endpoint.

---

## 7. JWT decoding & claims

### 7.1 When / where — CONFIRMED

Decoded on:

- Redux init (`initializeFromCookies`)
- `setCredentials` after login
- Ad-hoc via `useDecodedToken` / JWT UI widgets

### 7.2 Claims read by frontend — CONFIRMED

From `src/helpers/jwt.ts`:

| Claim                | Used as                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `UserId`             | User identity (parsed to number)                                               |
| `FullName`           | Display name (also mapped into `user.email`/`user.name`)                       |
| `RoleId`             | Primary role detection in Redux (`"1"`–`"4"`)                                  |
| `role`               | Alternate detection in `useDecodedToken` (`"Admin"`, `"SuperAdmin"`, `"User"`) |
| `OrganizationId`     | Org context in some forms                                                      |
| `AuthenticationType` | Typed; display/debug usage                                                     |
| `SecurityStamp`      | Typed; display/debug usage                                                     |
| `exp`, `iat`, `nbf`  | Display / `isTokenExpired` helper                                              |
| `iss`, `aud`         | Typed                                                                          |

### 7.3 Claim → capability chain (actual)

```text
JWT accessToken
  ↓ decode
  ↓ RoleId ("1"|"2"|"3"|"4")
  ↓ Redux flags (isAdmin / isSuperAdmin / isUser / isEvaluation)
  ├── Route allowlist (Evaluation vs default only)
  ├── Layout chrome (hide sidebar for Evaluation)
  ├── Dashboard widget variants
  └── Some form capabilities (e.g. SuperAdmin org/role pickers)
  ↓ separately
Backend GET /menus/user-menu
  ↓ Visible navigation (non-Evaluation)
```

There is **no** frontend permissions array between role and menu.

---

## 8. Role system

### 8.1 Recognized roles — CONFIRMED

| RoleId | Redux flag     | `role` string (useDecodedToken)      | i18n role labels          |
| ------ | -------------- | ------------------------------------ | ------------------------- |
| `"1"`  | `isAdmin`      | `"Admin"`                            | Admin                     |
| `"2"`  | `isSuperAdmin` | `"SuperAdmin"`                       | SuperAdmin                |
| `"3"`  | `isUser`       | `"User"`                             | User                      |
| `"4"`  | `isEvaluation` | **not checked** in `useDecodedToken` | **not in i18n roles map** |

Detection source of truth for routing/layout: **JWT `RoleId` via Redux**.  
`useDecodedToken` uses **`role` string** — dual detection paths.

Role changes mid-session: **not implemented** beyond receiving new tokens (would require new JWT).

Evidence:

- `src/pages/auth/login_with_device/slice.ts`
- `src/hooks/useDecodedToken.ts`
- `src/libs/i18n/en/pages/roles.ts`

### 8.2 Permissions — CONFIRMED absence

No frontend permission claims / ACL matrix from JWT. Admin UI exists to manage roles and role↔menu assignments (`/roles`, `/role-specific-menus`), but runtime nav uses **user-menu API**, not local permission lists.

### 8.3 Role → observed frontend access

| Capability (observed UI/route)     |    Admin    | SuperAdmin |  User   |      Evaluation       |
| ---------------------------------- | :---------: | :--------: | :-----: | :-------------------: |
| Default protected routes allowlist |      ✓      |     ✓      |    ✓    |  ✗ (restricted set)   |
| Evaluation route `/evaluation`     | ✗ allowlist |     ✗      |    ✗    |           ✓           |
| Sidebar / bottom nav               |      ✓      |     ✓      |    ✓    |        Hidden         |
| Dashboard User widgets             |      ✗      |     ✗      |    ✓    | n/a (no default dash) |
| Dashboard Admin widgets            |      ✓      |     ✗      |    ✗    |          n/a          |
| Dashboard SuperAdmin JWT tools     |      ✗      |     ✓      |    ✗    |          n/a          |
| Create user: pick org/role         |      ✗      |     ✓      |    ✗    |          n/a          |
| Server menus                       |   Via API   |  Via API   | Via API |   N/A (nav hidden)    |

This is **Observed frontend access**, not confirmed backend authorization.

---

## 9. Role → menu architecture

```text
Authenticated non-Evaluation user
        ↓
GET /menus/user-menu (Bearer + device headers)
        ↓
Backend returns menu list { id, name, description, menuUrl, isDeleted }
        ↓
Frontend sorts/maps for display
        ↓
Visible sidebar / dropdown / bottom nav
```

- Menus are **server-driven**, not hardcoded role→menu maps on the client.
- Frontend does **not** filter menus by `RoleId` locally.
- Nested menus: **not observed** in `IGetUserMenu` shape (flat list).
- Evaluation: menus not shown because chrome is omitted.

**Hidden menu ≠ route inaccessible by itself.** Route access is controlled separately by `ProtectedRoute` allowlists. A user can attempt a URL that is not in their menus; if it is on their allowlist and cookies exist, the router allows it. Backend may still reject APIs.

Evidence:

- `src/layouts/components/sidebar/service.ts`
- `src/layouts/components/sidebar/menus/index.tsx`
- `src/layouts/index.tsx`

---

## 10. Role → router architecture

### 10.1 Public / outside ProtectedRoute — CONFIRMED

| Path              | Notes                                    |
| ----------------- | ---------------------------------------- |
| `/accounts/login` | Login                                    |
| `/error`          | Error page                               |
| `/payment-info`   | Reachable without ProtectedRoute wrapper |
| `/lock`           | Reachable without ProtectedRoute wrapper |
| `*`               | Not found                                |

### 10.2 Protected tree — CONFIRMED

Layout `/` wraps children with `ProtectedRoute`.

**Authentication check:** cookie has `accessToken` **or** `refreshToken`.  
No JWT expiry check in the guard. No role hierarchy beyond Evaluation vs default.

**Authorization check:**

- Evaluation (`RoleId === "4"`): `/evaluation`, `/lock`, `/payment-info`
- Default: `/dashboard`, `/cities`, `/sold-item`, `/map`, `/menus`, `/organizations`, `/organizations/:id`, `/plans`, `/budgets`, `/owners`, `/contacts`, `/roles`, `/role-specific-menus`, `/announcement`, `/announcement/:id`, `/users`, `/user-announcement`, `/documents`, `/lock`, `/payment-info`

Missing auth → `/accounts/login` (original URL **not** preserved).  
Disallowed role route → navigate to `*`.  
Lock screen flag → force `/lock`.

Root index redirect: Evaluation → `/evaluation`, else → `/dashboard`.

Evidence:

- `src/router/components/protectedRouter/index.tsx`
- `src/router/components/redirect/index.tsx`
- `src/router/index.tsx`

### 10.3 Auth vs authorization distinction

```text
Authentication: "Do cookies indicate a session?" (token presence)
Authorization:  "Is this RoleId allowed on this pathname?" (allowlist)
```

Frontend enforcement is client-side only. **BACKEND AUTHORIZATION CONTRACT — UNKNOWN.**

---

## 11. HTTP client & interceptors

### 11.1 Clients — CONFIRMED

- **Primary:** one `axiosInstance` (`src/middleware/interceptor.ts`) used by `src/helpers/apiCall.ts`
- Refresh call uses **raw `axios.post`** (bypasses instance request interceptor) with `skipAuthRefresh`
- Separate non-auth currency axios usage exists (out of auth scope)

### 11.2 Request interceptor behavior — CONFIRMED

```text
API request
  ↓
Read accessToken from cookie
  ↓
If present → Authorization: Bearer <token>
  ↓
Ensure device id (localStorage or create)
  ↓
Headers: X-Device-Id, DeviceId
  ↓
If POST/PUT/PATCH object body → merge deviceId, userAgent, platform, language
  ↓
Send to VITE_BASE_API_URL
```

If no token: request proceeds **without** Authorization header.

### 11.3 Response interceptor — CONFIRMED

| Status        | Behavior                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| 402           | Snackbar; `window.location.href = /payment-info`                                                      |
| 403           | Write `sessionStorage.app_logout_message`; `logoutAndRedirect()` (message implies other-device login) |
| 401           | Refresh flow (below)                                                                                  |
| Network error | Snackbar “network error”                                                                              |
| Other         | Snackbar with API message or generic                                                                  |

No special frontend flows documented for 400/404/409/422 beyond generic error snackbar.

### 11.4 401 / refresh lifecycle — CONFIRMED

```text
401
  ↓ skipAuthRefresh or _retry? → reject
  ↓ no refreshToken cookie? → logoutAndRedirect
  ↓ single-flight refreshTokenPromise
  ↓ POST /accounts/refresh-token { refreshToken, token }
  ↓ success → write cookies (access, token, refresh) → retry original with new Bearer + device headers
  ↓ failure → clear tokens → logoutAndRedirect
```

Also:

- Concurrent 401s share one refresh promise (**CONFIRMED**)
- `_retry` prevents infinite refresh loop on the same request (**CONFIRMED**)
- Proactive expiry-based refresh before request: **NOT DETECTED** in interceptor
- `useDecodedToken.isTokenExpired` is informational/UI, not wired into transport

Duplicate unused helper: `src/helpers/refreshAuthTokens.ts` (different body shape: `{ refreshToken }` only).

---

## 12. Token expiration strategy (actual)

```text
Access JWT expires (server-side)
  ↓
Frontend typically still sends stale Bearer until API rejects
  ↓
Backend returns 401
  ↓
Interceptor refresh using refreshToken + token cookies
  ├── success → new cookies → retry
  └── failure / missing refresh → logout → /accounts/login
```

Cookie max-age (7/30 days) can outlive or underlive JWT `exp` — relationship **UNKNOWN** without backend confirmation.

---

## 13. Logout flow

### 13.1 Active user logout (AppBar) — CONFIRMED

```text
User clicks logout
  ↓
dispatch(logoutAndRedirect)
  ↓
Redux logout(): clear auth state + remove token cookies + remove some LS keys
  ↓
clearDeviceData() (device LS keys)
  ↓
window.location.href = /accounts/login
```

- Backend logout call: **not invoked** on this path
- Refresh/access server revocation: **UNKNOWN**
- Query cache menus: not explicitly cleared on this path (full page navigation remounts)

### 13.2 Forced logout (interceptor) — CONFIRMED

Triggered by failed refresh, missing refresh on 401, or 403. Same `logoutAndRedirect`. 403 additionally stages a login-page snackbar via sessionStorage.

### 13.3 Service logout method — CONFIRMED exists, INFERRED unused

`loginService.logout()` clears cookies then `POST /auth/logout`. No active AppBar/interceptor call sites found.

### 13.4 Dead logout helper — CONFIRMED

`src/helpers/handleLogout.ts` imports `@/pages/auth/login/slice` (path missing). Cross-tab `cookiesCleared` signaling lives there but is not on the active path.

---

## 14. Session restoration after refresh

```text
Browser refresh while cookies valid
  ↓
main.tsx loads interceptors
  ↓
Redux initializeFromCookies
  ├── decode accessToken → AUTHENTICATED + roles
  └── missing/invalid decode → UNAUTHENTICATED
  ↓
ProtectedRoute checks cookie presence (spinner while null)
  ↓
Layout loads; menus fetched if non-Evaluation
  ↓
No separate backend “validate session” call beyond normal APIs
```

If access cookie missing but refresh cookie present: ProtectedRoute may authorize; first 401 can refresh. Redux may still be unauthenticated until tokens rewritten — **INFERRED edge inconsistency**.

Invalid stored token decode → init returns unauthenticated flags (cookies may still remain until cleared elsewhere).

---

## 15. Multi-tab / multi-window

**Active path: NO CROSS-TAB AUTH SYNCHRONIZATION DETECTED**

- Cookies are shared across tabs (browser behavior)
- Redux is per-tab
- `useAuthService` implements `storage` event sync / periodic checks but **has no call sites**
- `handleLogout` cross-tab signal is unused/broken

**INFERRED:** Logout in one tab does not reliably update other tabs’ Redux until navigation/API failure.

---

## 16. Frontend ↔ backend auth contract

### Login

```text
Credentials + device context
  ↓
Backend authenticates (rules UNKNOWN)
  ↓
Returns accessToken + refreshToken JWTs/tokens
  ↓
Frontend persists cookies and derives identity/role from access JWT
```

### Authenticated request

```text
Cookie accessToken → Bearer header
Device id → headers (+ body on mutating requests)
  ↓
Backend validates (UNKNOWN: token, device binding, role)
  ↓
Response or 401/403/402
```

### Refresh

```text
{ refreshToken, token } → new accessToken + refreshToken
```

Exact rotation/reuse/device binding rules: **UNKNOWN — requires backend/source confirmation**

---

## 17. Auth state machine (implied by code)

States that exist or are strongly implied:

```text
INITIALIZING (ProtectedRoute isAuthorized === null → spinner)
  ├── cookies present → AUTHENTICATED_GATE_PASS
  │     ├── route allowlist OK → AUTHENTICATED_IN_APP
  │     └── allowlist fail → REDIRECT_NOT_FOUND
  └── no cookies → UNAUTHENTICATED → /accounts/login

UNAUTHENTICATED
  ↓ submit login
AUTHENTICATING
  ├── success → AUTHENTICATED_IN_APP
  └── failure → UNAUTHENTICATED (+ error UI)

AUTHENTICATED_IN_APP
  ↓ 401
REFRESHING (single-flight)
  ├── success → AUTHENTICATED_IN_APP (retry)
  └── failure → LOGGING_OUT → UNAUTHENTICATED

AUTHENTICATED_IN_APP
  ↓ 403 or explicit logout
LOGGING_OUT → UNAUTHENTICATED
```

No dedicated `REFRESHING` Redux state — refresh is interceptor-local.  
No `SESSION_EXPIRED` enum — behavior is logout + snackbar.

---

## 18. Scenario traces

### A — Successful login

Open `/accounts/login` → clear cookies/device LS → fingerprint device → submit userName/password + device fields → backend returns tokens → cookies set → JWT decoded → RoleId flags → redirect Evaluation or dashboard → subsequent APIs send Bearer + device → menus loaded (if not Evaluation).

### B — Browser refresh while authenticated

Cookies survive → Redux rehydrates from accessToken → guard passes → app continues; menus refetch as React Query runs.

### C — Expired access token

Request with expired Bearer → 401 → refresh with cookies → new tokens → retry; or logout if refresh fails/missing.

### D — Unauthorized route (wrong role allowlist)

Authenticated Evaluation user opens `/users` → `hasAccess=false` → `Navigate` to `*`.

### E — Hidden menu vs direct URL

Menu absence does not equal route block. Default roles share one large allowlist; visibility is menu API. Direct URL works if allowlisted and cookies exist.

### F — Logout

AppBar → local clear + hard redirect; **no backend logout** on active path.

---

## 19. Current architectural risks

Documented for the monorepo rewrite (do not treat as change requests here):

| Risk                                                                                        | Why it matters                                        |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Dual role detectors (`RoleId` vs `role` string)                                             | Inconsistent Evaluation / role UX if claims diverge   |
| Multiple token cookie writers / helpers (`sameSite: strict` vs `None` in `helpers/auth.ts`) | Divergent security behavior if wrong helper is used   |
| Duplicate refresh implementations                                                           | Drift in refresh body and cookie options              |
| Multiple device ID systems (active SHA-256 vs legacy DeviceKey)                             | Confusion; wrong binding if mixed                     |
| Tokens in non-httpOnly cookies                                                              | XSS can exfiltrate session                            |
| ProtectedRoute trusts cookie presence, not JWT validity                                     | Stale/invalid access can pass UI gate until API fails |
| Login page always clears session                                                            | Visiting login logs the user out client-side          |
| Active logout skips backend `/auth/logout`                                                  | Server session/device may remain valid                |
| `logout` reducer does not clear `isEvaluation`                                              | Stale flag risk until full remount/re-init            |
| `payment-info` / `lock` outside ProtectedRoute                                              | Accessible without auth gate                          |
| Dead `handleLogout` / unused `useAuthService`                                               | False sense of cross-tab security                     |
| Frontend-only route/menu security                                                           | Must not be mistaken for backend authorization        |
| Constants file aspirational device/auth endpoints                                           | Not the live contract (`ENDPOINTS` is)                |

---

## 20. Migration contract for new monorepo

### MUST PRESERVE (confirmed behavior)

1. Login with `userName` + `password` + device fingerprint fields (`deviceId`, `userAgent`, `platform`, `language`)
2. Persist access + refresh tokens for subsequent requests
3. Attach Bearer access token on API calls
4. Attach device identity on API calls (headers; mutating body enrichment if backend still requires it)
5. Decode access JWT for `UserId`, `FullName`, `RoleId`, `OrganizationId`, `role`
6. RoleId mapping: `1` Admin, `2` SuperAdmin, `3` User, `4` Evaluation
7. Post-login redirect: Evaluation → evaluation home; others → dashboard
8. Server-driven user menus for navigation
9. Evaluation hides primary nav chrome and is limited to evaluation allowlist routes
10. 401 → refresh with single-flight + one retry; failure → force login
11. 403 → force logout with “other device” messaging semantics
12. 402 → payment-info diversion
13. Session restore from stored access token on reload
14. Logout clears client auth artifacts and returns to login

### SHOULD IMPROVE (without changing external behavior)

1. Single auth/session module as source of truth
2. Single HTTP client + interceptor policy
3. Single role resolution path (prefer one claim)
4. Single device-id strategy
5. Explicit session initialization gate before protected UI
6. Central route + menu authorization policy
7. Call backend logout if product requires server revocation
8. Cross-tab session sync if product requires it
9. Align cookie attributes and remove dead helpers

### CURRENTLY UNKNOWN (confirm before rewrite)

1. JWT signing, TTL, and refresh rotation rules
2. Whether refresh requires `token` + `refreshToken` or refresh alone
3. Device binding / single-device enforcement on backend
4. Whether `/auth/logout` invalidates refresh tokens/devices
5. Canonical JWT `role` string for Evaluation (`RoleId` `4`)
6. Exact menu assignment rules per role on server
7. Whether APIs enforce role independently of frontend allowlists
8. Meaning of 403 beyond client messaging assumption

---

## 21. Responsibility boundaries (conceptual)

Adapt package names to the new monorepo; preserve separation of concerns:

```text
auth / session
  Login/logout lifecycle
  Token persistence & restore
  JWT claim → identity/role projection
  Device fingerprint lifecycle

api / transport
  Generated Orval clients
  Shared HTTP transport
  Auth header + device header injection
  401 refresh / 403 / 402 policies

core / authorization concepts
  Role identifiers & mappings
  Capability definitions (if introduced)
  Route/menu policy types

apps/*
  Compose routes and menus
  App-specific UI gating
  Never re-implement token refresh ad hoc
```

### Orval boundary

```text
Generated API layer (operations/DTOs only)
        ↓
API transport (base URL, serializers)
        ↓
Authentication interceptor (tokens + device + refresh)
        ↓
Application session (who is logged in / role flags)
        ↓
Authorization policies (routes/menus/capabilities)
        ↓
UI composition
```

Generated clients must not own cookie storage, refresh loops, or role menus. They should use the shared authenticated transport.

---

## 22. Final auth architecture

1. **Authentication source of truth:** Backend login/refresh issuance; client treats cookie tokens as session proof.
2. **Token source of truth:** Browser cookies (`accessToken` / `refreshToken` / `token`); Redux is a derived mirror.
3. **Device ID source of truth:** Frontend SHA-256 fingerprint; persisted under `app_device_id` for transport.
4. **Role source of truth (frontend):** JWT `RoleId` (Redux); secondary `role` string in some hooks.
5. **Permission source of truth:** **None on frontend**; server role-menu admin + user-menu API.
6. **Menu source of truth:** Backend `/menus/user-menu`.
7. **Route authorization source of truth (frontend):** Hardcoded Evaluation vs default allowlists in `ProtectedRoute`.
8. **Backend authorization responsibility:** Assumed authoritative but **unverified** from this repo alone.
9. **Interceptor responsibility:** Attach Bearer + device; refresh on 401; logout on refresh failure/403; divert on 402.
10. **Session restoration:** Decode `accessToken` cookie into Redux on store init; guard checks cookie presence.
11. **Token expiration strategy:** Reactive 401 refresh; no proactive transport refresh.
12. **Logout strategy (active):** Client-side clear + hard redirect; backend logout unused.
13. **Known risks:** Dual detectors/storage/helpers; non-httpOnly cookies; UI-only guards; unused cross-tab sync; login page clears session.
14. **Unknown backend contracts:** Token TTL/rotation, device enforcement, logout revocation, Evaluation role name, API RBAC.

---

## 23. Evidence index (primary files)

| Concern             | Paths                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boot / interceptors | `src/main.tsx`, `src/middleware/interceptor.ts`                                                                                                            |
| Login UI / request  | `src/pages/auth/login_with_device/index.tsx`, `service.ts`, `model.ts`                                                                                     |
| Login success       | `src/pages/auth/login_with_device/utils/handleLoginSuccess .tsx`                                                                                           |
| Session / roles     | `src/pages/auth/login_with_device/slice.ts`                                                                                                                |
| JWT claims          | `src/helpers/jwt.ts`, `src/hooks/useDecodedToken.ts`                                                                                                       |
| Device ID           | `src/pages/auth/login_with_device/utils/deviceUtils.tsx`, `useDeviceId.ts`                                                                                 |
| HTTP wrapper        | `src/helpers/apiCall.ts`                                                                                                                                   |
| Routes / guards     | `src/router/index.tsx`, `src/router/components/protectedRouter/index.tsx`, `redirect/index.tsx`                                                            |
| Menus               | `src/layouts/components/sidebar/service.ts`, `menus/index.tsx`, `src/layouts/index.tsx`                                                                    |
| Endpoints / env     | `src/constants/endpoints.ts`, `env/.env.*`, `vite.config.ts` (`envDir`)                                                                                    |
| Logout UX           | `src/layouts/components/appbar/index.tsx`                                                                                                                  |
| Legacy / unused     | `src/hooks/useAuthService.ts`, `src/helpers/handleLogout.ts`, `src/helpers/refreshAuthTokens.ts`, `src/middleware/device/*`, `src/middleware/deviceKey.ts` |

---

_This document describes observed frontend runtime behavior only. Backend semantics marked UNKNOWN must be confirmed against API source or contract tests before monorepo implementation._
