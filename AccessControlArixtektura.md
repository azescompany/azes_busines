# AZES — ROLE SYSTEM & AUTHORIZATION ARCHITECTURE

**Document:** `role_system.md`  
**Status:** Architecture specification — implementation must follow approved phases  
**Scope:** Identity, Authentication, Authorization, Organizations, Branches, Modules, Menus, Permissions, Subscriptions, Access Resolution and Audit  
**Primary rule:** This document is the source of truth for the role and access-control architecture.

---

## 1. ROLE AND OBJECTIVE

You are the Principal Software Architect working on the existing AZES monorepo.

Your responsibility is to audit the existing implementation and progressively build a secure, maintainable, scalable, multi-tenant role and authorization system that follows this document.

The objective is not to create a collection of unrelated role checks. Build one centralized authorization architecture that governs the entire platform.

The architecture must support:

- Platform-level administration.
- Organization and tenant management.
- Multiple branches, departments and teams.
- Global users who can belong to multiple organizations.
- Subscription-based module entitlements.
- Centralized module, menu and permission registries.
- Role-based and scope-based authorization.
- Delegated administration.
- Backend-generated, user-specific navigation menus.
- Efficient authentication and request processing.
- Reliable access revocation and audit logging.

### Mandatory working rules

1. Do not rewrite existing systems blindly.
2. Audit the current repository before proposing code changes.
3. Reuse existing AZES packages, authentication infrastructure, API conventions, UI components and design tokens where appropriate.
4. Do not introduce duplicate authentication, authorization or organization-management systems.
5. Do not invent files, endpoints, database tables or existing functionality without inspecting the repository.
6. Do not start implementing the entire architecture in one operation.
7. Implement one approved phase at a time.
8. Every phase must include tests, validation, documentation and a concise report.
9. Preserve existing working functionality unless a documented migration requires changing it.
10. If the current code contradicts this document, report the discrepancy and propose a migration before making breaking changes.
11. Never expose secrets, tokens, private keys or privileged bootstrap credentials in source code, frontend bundles, logs or documentation.
12. Do not weaken security to simplify implementation.

## 2. FIRST ACTION: REPOSITORY AUDIT

Before writing or modifying implementation code:

- Inspect the monorepo structure, package manager, applications and shared packages.
- Identify the current frontend and backend authentication flows.
- Locate login, token creation, token validation, refresh, logout and API request interceptors.
- Inspect the current user, organization, membership, role, permission and module models.
- Identify existing authorization middleware and tenant-isolation mechanisms.
- Inspect API generation and client conventions.
- Inspect database technology, migrations and testing infrastructure.
- Identify duplicated logic, missing checks, security risks and incompatible assumptions.
- Determine which components can be reused and which require changes.

Create an audit report containing:

- Existing implementation.
- Current problems.
- Security gaps.
- Required changes.
- Reusable components.
- Proposed migration sequence.
- Risks and backward-compatibility considerations.

Do not begin large-scale implementation before the audit is reviewed.

## 3. CORE DOMAIN MODEL

The following concepts must remain distinct.

### 3.1 User

A global account representing a person who authenticates into AZES.

A user may belong to more than one organization and may have different roles in each organization.

A user account must not contain a single mandatory `organizationId` as the only representation of organizational membership.

### 3.2 Organization

A tenant or business customer.

Every organization-owned resource must be isolated from other organizations.

### 3.3 Organization Unit

A hierarchical organizational structure supporting arbitrary depth:

Organization → Branch → Department → Team → Subteam.

Use a parent-child structure rather than limiting the architecture to a single `branchId`.

A unit may represent a branch, department, team or another supported organizational level.

### 3.4 Membership

An explicit relationship between a user and an organization.

Membership determines whether the user is an active member of that organization.

Membership is separate from the global user account.

### 3.5 Module

A registered functional package, such as:

- CRM
- Sales
- Finance
- Accounting
- HR
- Inventory
- Purchasing
- Reporting

A module exists once in the platform registry. It must not be independently duplicated for every organization.

### 3.6 Menu

A navigation entry or page belonging to a module.

Menus form a hierarchical tree and use stable technical codes.

Examples:

- `crm.dashboard`
- `crm.customers`
- `sales.orders`
- `finance.invoices`
- `finance.reports`

A menu is a navigation concept, not an authorization boundary.

### 3.7 Permission

A specific action a user is allowed to perform on a resource.

Examples:

- `crm.customers.read`
- `crm.customers.create`
- `crm.customers.update`
- `crm.customers.delete`
- `sales.orders.approve`
- `accounting.invoices.post`
- `accounting.invoices.refund`
- `reports.export`

CRUD permissions alone are insufficient. Support business actions such as approve, assign, export, publish, close, post, refund and manage.

### 3.8 Role

A reusable collection of menu access and permissions.

Roles may be platform-defined or organization-defined, subject to the authorization rules in this document.

### 3.9 Scope

The data and organizational boundaries within which a permission may be exercised.

Examples:

- Entire organization.
- A specific branch.
- A department.
- A team.
- Explicitly assigned records.

Permission and scope must always be evaluated together.

### 3.10 Subscription and Entitlement

A subscription defines the modules and limits an organization is entitled to use.

A module cannot be activated merely because it exists in the platform registry.

## 4. SYSTEM ROLES AND AUTHORITY

Implement the following authority model.

### 4.1 SuperAdmin

SuperAdmin is the protected platform-owner identity.

Requirements:

- Full platform-level authority.
- Not listed in ordinary role-management interfaces.
- Not assignable by GeneralAdmin or organization administrators.
- Must not depend on a hidden frontend menu or a hardcoded frontend role check.
- Must be protected by dedicated server-side authorization rules.
- Must use strong authentication, preferably MFA or passkeys.
- Critical actions must be audited.
- Sensitive operations should use explicit elevation or reauthentication where appropriate.
- Bootstrap and recovery procedures must be documented securely.
- No permanent secret or privileged identity credential may be committed to Git.

Do not assume that hiding the identity from the UI is sufficient security.

SuperAdmin authorization must be enforced independently of organization-defined roles.

### 4.2 GeneralAdmin

GeneralAdmin manages the platform and its tenants.

Responsibilities:

- Create and manage organizations.
- Provision initial organization administrators.
- Manage platform users where authorized.
- Manage module registry.
- Manage menu registry.
- Manage permission registry.
- Manage subscription plans and subscriptions.
- Assign entitled modules to organizations.
- Configure platform role templates.
- Manage organization provisioning.
- Inspect platform audit records.
- Manage platform-level settings.

GeneralAdmin must not automatically gain unrestricted access to every organization's business data. Platform administration and tenant business-data access must remain separate capabilities.

GeneralAdmin cannot create, assign or modify SuperAdmin authority.

### 4.3 Admin

Admin is the organization administrator.

Admin may:

- Manage its own organization.
- Manage organizational units, branches and departments.
- Invite, create or deactivate users within permitted policy.
- Assign roles and permissions within its delegation authority.
- Assign users to branches or departments.
- Manage organization-defined roles.
- Configure access to modules already entitled and activated for the organization.
- Inspect organization-level audit events.
- Manage permitted organization settings.

Admin cannot:

- Activate a module not allowed by the subscription.
- Grant platform-level permissions.
- Assign SuperAdmin or GeneralAdmin authority.
- Access another organization without an explicit authorized relationship.
- Grant permissions or scopes beyond its own delegation ceiling.

An organization administrator must receive the appropriate administrative navigation for its organization's active modules.

### 4.4 SubAdmin

Do not implement SubAdmin as a mandatory, hardcoded fifth global system role.

Represent delegated administration through organization-defined roles, such as:

- Branch Manager.
- Department Manager.
- Team Supervisor.

A delegated administrator may manage users and resources within its assigned organizational scope, provided it has the necessary permissions.

For example, a Baku branch manager must not be able to:

- Read Ganja branch data.
- Manage users outside the assigned scope.
- Grant permissions the manager does not possess or cannot delegate.
- Assign higher-level administrative authority.
- Activate unentitled modules.
- Change platform security policies.

### 4.5 User

A normal user may access only:

- Authorized organizations.
- Assigned active modules.
- Authorized menus.
- Permitted actions.
- Data within the user's effective scope.

The backend must deny unauthorized operations even if the user manually changes the frontend, URL, request body or API call.

## 5. AUTHENTICATION AND TOKEN ARCHITECTURE

### 5.1 Objective

Avoid unnecessary repeated database lookups for user identity and organization context during page reloads and API requests.

At login, the backend already knows the authenticated user and can resolve the initial session context. It should issue a signed token containing the minimum required identity and session claims.

The frontend must not need to independently rediscover the user ID or organization ID on every reload.

### 5.2 Login flow

Implement the following conceptual flow:

1. The user submits login credentials.
2. The backend verifies the credentials.
3. The backend resolves the user identity and permitted initial organization context.
4. The backend creates a secure session and issues a signed access token.
5. The client stores credentials according to the approved secure token-storage design.
6. API requests include the access token in the Authorization header when using the Bearer authentication strategy.
7. The backend validates the token and derives the request identity and context from its trusted claims.
8. The backend does not trust user IDs, organization IDs, roles or scopes supplied independently in request bodies or query parameters.

Example request header:

`Authorization: Bearer <access_token>`

### 5.3 Token claims

Design a versioned, signed access-token payload containing only the minimum necessary claims, for example:

- `sub`: immutable user ID.
- `sid`: session ID or equivalent session reference.
- `org`: active organization ID, when an organization context is selected.
- `mid`: active organization membership ID, when applicable.
- `iss`: trusted issuer.
- `aud`: intended API audience.
- `iat`: issued-at time.
- `exp`: expiration time.
- `jti`: unique token ID where useful.
- `ver`: relevant authentication or access-policy version where supported.

Use stable identifiers rather than display names.

Do not embed:

- Passwords or credentials.
- Refresh tokens inside access tokens.
- Secrets or signing keys.
- The entire organization tree.
- Full menu trees.
- Large permission lists.
- Sensitive personal data.
- Data that changes frequently and must be immediately revocable.

A role name in a token must never be the sole proof of current authorization.

The token establishes a verifiable identity and session context. The authorization system determines the user's effective current access.

### 5.4 Avoid repeated identity lookups

The backend should derive `userId`, session identity and active organization context from verified token claims rather than requiring a separate user lookup solely to rediscover those values on every request.

Do not implement an unnecessary chain such as:

`Request → token decode → user lookup → organization lookup → role lookup → menu lookup`

for every API request if those lookups can be safely avoided or consolidated.

Use the following principles:

- Verify the access token cryptographically.
- Extract trusted identity and context claims.
- Reuse verified request context throughout middleware and handlers.
- Avoid duplicate database queries inside a single request.
- Resolve current authorization through a centralized policy service.
- Use bounded, invalidatable caching where appropriate.
- Avoid fetching the entire user, organization and permission graph on every request.
- Keep authorization checks server-side.
- Define an explicit strategy for revoked sessions, removed memberships, disabled users and changed access.

A stateless token must not become a mechanism for preserving revoked permissions indefinitely.

### 5.5 Token storage and Authorization header

Security takes precedence over convenience.

Preferred browser design:

- Keep short-lived access tokens in memory where practical.
- Store refresh credentials in `Secure`, `HttpOnly`, appropriately configured `SameSite` cookies.
- Use the frontend API client/interceptor to attach `Authorization: Bearer <access_token>` to API requests.
- After a full page reload, use a refresh/session endpoint to obtain a new access token without asking the user to log in again when the session remains valid.
- Do not perform separate user and organization discovery requests just to reconstruct identity already known by the backend.
- Apply CSRF protection to cookie-authenticated refresh and logout flows as appropriate.

If the existing AZES architecture requires the access token itself to be persisted in a cookie and read by JavaScript to build the Bearer header, explicitly document the XSS exposure and compare the trade-offs before adopting it.

An `HttpOnly` cookie cannot be read by JavaScript to construct a Bearer header. Do not claim that both properties can be achieved by the same cookie.

Never store long-lived refresh tokens in JavaScript-readable storage.

Do not put access tokens in URLs, logs, analytics, error messages or browser-visible debug output.

### 5.6 Refresh, expiry and logout

Implement:

- Short-lived access tokens.
- Refresh-token rotation or an equivalent secure session-renewal strategy.
- Refresh-token reuse detection where applicable.
- Session invalidation on logout.
- Defined expiry and renewal behavior.
- Revocation for disabled users and compromised sessions.
- Concurrent refresh handling to prevent duplicate refresh requests.
- Clear handling of expired or invalid credentials.
- A single coordinated client refresh flow rather than independent refresh attempts from every API call.

Use the existing AZES authentication implementation where it meets these requirements. Do not create a second parallel authentication system.

### 5.7 Authorization changes and token freshness

Changes to organization membership, roles, permissions, module entitlements or scope must take effect according to a documented revocation policy.

Do not rely on a long-lived JWT containing a static role or permission list.

Possible mechanisms include:

- Short access-token lifetime.
- Session or authorization versioning.
- Centralized policy checks.
- Server-side cached authorization data with reliable invalidation.
- Session revocation for sensitive changes.

If a token contains a version claim, define exactly where the current version is obtained and how caching works. Do not add a database lookup on every request merely to check a version without evaluating the performance trade-off.

For high-risk actions, enforce current authorization rather than trusting stale cached claims.

## 6. ORGANIZATION CONTEXT

A user may belong to multiple organizations.

The active organization context must be explicit and validated.

Provide an organization-switching mechanism where authorized.

When switching organizations:

1. Verify that the user has an active membership in the target organization.
2. Verify that the target organization is accessible to the user.
3. Establish the new trusted context using the approved session or token-renewal strategy.
4. Recompute effective access.
5. Invalidate incompatible cached context.
6. Prevent requests from continuing under an unintended previous organization.

Never allow a client to select an arbitrary organization ID and thereby obtain access to it.

For organization-owned data, enforce tenant isolation in repository/service/query layers and at API boundaries. Do not rely only on frontend filtering.

## 7. MODULE, MENU AND PERMISSION REGISTRIES

### 7.1 Central registry

Create or adapt centralized registries for:

- Modules.
- Menus.
- Permissions.
- Role templates.
- Module dependencies and versions where needed.

Each registry entry should have a stable technical identifier, display metadata, status and lifecycle rules.

Module and permission technical codes must not depend on translated display labels.

### 7.2 Example module

The `finance` module may register:

- `finance.dashboard`
- `finance.accounts`
- `finance.invoices`
- `finance.payments`
- `finance.expenses`
- `finance.reports`

Possible permissions include:

- `finance.invoices.read`
- `finance.invoices.create`
- `finance.invoices.update`
- `finance.invoices.post`
- `finance.invoices.refund`
- `finance.reports.read`
- `finance.reports.export`

Register these centrally once.

Do not clone the module's menu definitions for every organization.

### 7.3 Menu evolution

When a new menu is added to an existing module, eligible organizations should receive it according to the module-version and access policy.

For example:

- Newly registered menus become available to organizations entitled to the relevant module.
- Organization administrators receive the applicable administrative menu by default.
- Normal users receive the menu only if their effective role/menu configuration grants it.
- Sensitive new actions must not automatically become authorized simply because a menu was added.
- Breaking menu or permission changes must have a migration strategy.

Do not silently grant newly introduced sensitive permissions to every existing user.

## 8. SUBSCRIPTION AND MODULE ENTITLEMENTS

Module availability must follow this sequence:

1. The module exists in the platform registry.
2. The organization's subscription or entitlement permits the module.
3. The module is assigned and enabled for the organization.
4. The user's role and permissions allow access.
5. The user's scope allows the requested data operation.

A module's existence does not imply entitlement for every organization.

Example:

- Organization A: CRM + Sales.
- Organization B: CRM + Sales + Finance.
- Neither organization: HR.

Organization A must not access Finance by manipulating the UI or calling the API directly.

Organization B may use Finance only while its entitlement and module state allow it.

Define behavior for:

- Subscription expiry.
- Grace periods.
- Read-only mode.
- Module suspension.
- Module removal.
- Subscription plan changes.
- Usage limits.
- Historical data retention.

Disabling a module must not automatically delete its data.

The backend must enforce entitlement rules independently of menu visibility.

## 9. ROLE, MENU AND PERMISSION RESOLUTION

Implement one centralized Access Resolver or equivalent policy service.

Do not scatter inconsistent authorization logic throughout controllers and frontend components.

The resolver must consider:

1. Authenticated user and valid session.
2. Active user status.
3. Active organization membership.
4. Organization status.
5. Subscription and module entitlements.
6. Module activation state.
7. Role assignments.
8. Menu assignments.
9. Effective permissions.
10. Organization-unit and record-level scope.
11. Delegation limits.
12. Relevant business rules.

Conceptually:

`Effective Access = Identity ∩ Membership ∩ Tenant ∩ Entitlement ∩ Role/Menu ∩ Permission ∩ Scope ∩ Business Policy`

This is a policy model, not a requirement to execute a separate database query for every term.

### Default-deny rule

If access cannot be established confidently, deny the operation.

Do not treat a missing permission record, failed policy lookup or unknown module as authorization.

### Role templates

Provide reusable templates such as:

- Organization Administrator.
- Branch Manager.
- Accountant — Read Only.
- Accountant — Full Operations.
- Sales Representative.
- Sales Manager.
- Inventory Operator.
- Auditor — Read Only.

Templates should be copied or versioned according to an explicit lifecycle policy.

Changing a template must not unexpectedly broaden existing users' access without a documented policy.

### User-specific overrides

If user-level permission overrides are supported:

- Model grants and restrictions explicitly.
- Define precedence rules.
- Audit all changes.
- Do not allow a user override to bypass subscription, tenant isolation, delegation or platform security boundaries.
- Apply explicit deny or restriction semantics consistently.

## 10. BACKEND-GENERATED NAVIGATION MENUS

This is a mandatory architecture requirement.

**The backend computes the effective menu tree. The frontend renders the returned tree.**

The frontend must not maintain a separate authoritative list of allowed menus or derive security from role names.

### Organization Admin

The backend returns the navigation menus for the organization's enabled and entitled modules according to the administrator's authorized administrative policy.

### Normal User

The backend returns only the menus permitted by the user's effective assignments.

For example, an Accountant — Read Only may receive:

- Dashboard.
- Finance Reports.

A Sales Manager may receive:

- Dashboard.
- Customers.
- Orders.
- Payments.
- Sales Reports.

The exact tree is derived from the registered menu catalog and effective access configuration.

### Backend endpoint

Implement or adapt:

`GET /api/v1/me/access`

The response should include, as appropriate:

- Active organization context.
- Effective modules.
- Hierarchical menu tree.
- Effective permission identifiers.
- Scope summary.
- Access version or equivalent cache metadata.
- Any additional client context required by the current architecture.

Example conceptual response:

```json
{
  "organizationId": "org_002",
  "accessVersion": 18,
  "modules": [
    {
      "code": "finance",
      "menus": [
        {
          "code": "finance.dashboard",
          "permissions": ["finance.dashboard.read"]
        },
        {
          "code": "finance.reports",
          "permissions": ["finance.reports.read"]
        }
      ]
    }
  ],
  "scopes": {
    "organizationIds": ["org_002"],
    "unitIds": ["branch_baku"]
  }
}
```

This is an illustrative contract. Adapt the exact shape to the existing API conventions and menu hierarchy.

The frontend may cache the response for rendering and avoid redundant fetches. It must refresh or invalidate the cached access response when the organization context, session, role assignment or relevant access version changes.

**A menu appearing in `/me/access` does not authorize every operation on that page.** Every protected API action must enforce its own permission and scope.

## 11. API AND MIDDLEWARE DESIGN

Audit existing endpoints before introducing new ones.

Potential endpoints include:

- `GET /api/v1/me`
- `GET /api/v1/me/access`
- `POST /api/v1/me/active-organization`
- `GET /api/v1/organizations/:id/modules`
- `GET /api/v1/organizations/:id/members`
- `GET /api/v1/organizations/:id/roles`
- `GET /api/v1/modules/:code/menus`
- `PUT /api/v1/organizations/:id/members/:memberId/roles`

These are architectural examples, not permission to create duplicates of existing routes.

Implement reusable middleware or service boundaries for:

- Authentication.
- Active session validation.
- Organization context.
- Tenant isolation.
- Subscription entitlement.
- Permission evaluation.
- Scope enforcement.
- Delegation checks.
- Audit logging.

Management endpoints must authorize the requested action and target resource, not just confirm that the caller is authenticated.

Never trust a client-provided `userId`, `organizationId`, `roleId`, `unitId` or scope merely because it exists in a request.

## 12. DELEGATION RULES

Implement a clear delegation ceiling.

An administrator may grant only the authority that:

- Exists in the relevant organization.
- Is allowed by the organization's subscription and module entitlements.
- Is within the administrator's own grantable authority.
- Is within the target user's permitted organizational scope.
- Does not cross a platform-level security boundary.

A branch manager cannot create a role with broader authority than the branch manager can delegate.

A normal Admin cannot assign platform-level roles.

An organization cannot grant itself a module that the platform has not entitled.

Reject unauthorized delegation on the backend and create an audit event for sensitive attempts where appropriate.

## 13. DATA MODEL

Inspect the existing schema first. Adapt the following logical entities rather than blindly duplicating tables.

Core entities may include:

- `users`
- `sessions` or an equivalent session store
- `organizations`
- `organization_memberships`
- `organization_units`
- `unit_memberships`
- `modules`
- `module_versions` where needed
- `menus`
- `permissions`
- `subscription_plans`
- `subscriptions`
- `plan_modules`
- `organization_modules`
- `roles`
- `role_permissions`
- `role_menus`
- `user_role_assignments`
- `user_permission_overrides` where required
- `audit_logs`

Additional entities may be justified for:

- Organization provisioning.
- Entitlement history.
- Role templates and template versions.
- Delegation policies.
- Permission scopes.
- Session revocation.
- Access-version management.

Define relationships, unique constraints, indexes, foreign keys, deletion policies and migration rules.

Use soft deletion or historical records where required for auditability and business-data integrity.

Do not create unnecessary entities without explaining their purpose.

## 14. SECURITY AND AUDIT

The system must address:

- Broken object-level authorization.
- Cross-tenant data access.
- Privilege escalation.
- Unauthorized role assignment.
- Unauthorized module activation.
- Stale permissions.
- Token theft and replay.
- Session fixation.
- Refresh-token reuse.
- CSRF and XSS risks.
- Sensitive information in logs.
- Concurrent changes to roles or membership.
- Unauthorized access after account deactivation.
- Improper direct API access.
- Insecure SuperAdmin bootstrap.

Audit important events, including:

- Login and logout.
- Session revocation.
- Organization creation and suspension.
- Membership changes.
- Module assignment and removal.
- Subscription changes.
- Role creation and modification.
- Permission and scope changes.
- Delegated administration changes.
- Privileged platform actions.
- Failed high-risk authorization attempts.

Audit records should include actor, action, target, organization context when applicable, timestamp and relevant non-sensitive metadata.

Never log bearer tokens, refresh tokens, passwords or private signing material.

## 15. ACCESS CACHING AND INVALIDATION

Use caching only when correctness and revocation behavior are explicitly defined.

Examples:

- Module assigned: eligible users receive the new module according to policy.
- Module disabled: the menu is removed and protected API actions are denied.
- Role revoked: access is revoked within the documented security window.
- Branch assignment changed: the old scope is no longer effective.
- User disabled: new authenticated operations are denied.
- New menu registered: eligible organizations receive it according to module and role policy.

An `accessVersion` may help the frontend and backend detect stale access responses. It is not itself an authorization check.

Document:

- Cache keys.
- Cache lifetime.
- Invalidation triggers.
- Multi-instance behavior.
- Failure behavior.
- Maximum acceptable revocation delay.
- Which high-risk operations bypass stale cached authorization.

Never rely on the frontend clearing its cache as the only way to revoke access.

## 16. FRONTEND REQUIREMENTS

The frontend consumes the backend's effective access response.

It must:

- Render only returned menu entries.
- Respect the returned hierarchy.
- Support loading, empty, error and expired-session states.
- Avoid repeated `/me/access` calls during one stable application initialization.
- Refresh access data when organization context or authorization changes.
- Use the existing AZES design system and components.
- Avoid duplicating module/menu registry definitions across unrelated frontend applications.
- Avoid treating hidden buttons or hidden menu entries as security controls.

The frontend may hide or disable an action based on returned permissions for usability. The backend remains the authoritative enforcement layer.

Do not introduce a new UI library or redesign the existing product as part of this authorization task unless separately approved.

## 17. TESTING REQUIREMENTS

Tests must cover both allowed and denied behavior.

At minimum, verify:

1. Unauthenticated requests are rejected.
2. Invalid, expired and incorrectly signed tokens are rejected.
3. Disabled users cannot perform protected operations.
4. A user cannot access an organization without active membership.
5. Cross-tenant access is denied.
6. An unentitled module cannot be activated.
7. A disabled module's APIs are blocked.
8. Organization Admin receives only the organization's eligible module menus.
9. Normal users receive only their permitted menu tree.
10. Menu visibility does not bypass action permissions.
11. Read-only users cannot create, update, delete or approve unless explicitly authorized.
12. Branch administrators cannot access other branches.
13. Administrators cannot grant permissions beyond their delegation ceiling.
14. Revoked roles and memberships stop authorizing requests within the documented revocation window.
15. Organization switching cannot create unauthorized access.
16. Refresh and logout behave correctly under concurrent requests.
17. SuperAdmin cannot be assigned through ordinary role management.
18. Subscription expiry follows the defined policy without unintended data deletion.
19. Missing or failed policy evaluation defaults to deny.
20. Existing authentication and API behavior remains compatible where required.

Use the repository's existing test tools and conventions.

## 18. IMPLEMENTATION PHASES

Implement the architecture in separate, reviewable phases.

### Phase 0 — Audit and baseline

- Inspect the repository.
- Document current architecture.
- Identify gaps and risks.
- Run existing tests, type checks, lint and build.
- Establish a baseline.

Deliverable: `docs/role-system/audit.md` or an appropriate existing documentation location.

### Phase 1 — Domain model and access specification

- Finalize entity relationships.
- Define system and organization roles.
- Define scope and delegation rules.
- Define module/menu/permission contracts.
- Define subscription-entitlement behavior.
- Define authorization and token-freshness policies.

Deliverable: approved architecture and data model.

### Phase 2 — Authentication and request context

- Reuse or improve existing authentication.
- Standardize token claims and validation.
- Implement trusted request context.
- Remove redundant identity lookups where safe.
- Define refresh, logout and revocation.
- Ensure secure client token handling.

Deliverable: tested authentication and request-context flow.

### Phase 3 — Organization and membership foundation

- Implement or adapt organizations.
- Implement memberships.
- Implement organizational-unit hierarchy.
- Enforce tenant isolation.
- Support secure organization switching.

Deliverable: tested multi-tenant foundation.

### Phase 4 — Registries and entitlements

- Implement or adapt module, menu and permission registries.
- Implement subscription entitlements.
- Implement organization-module assignments.
- Define registry versioning and menu evolution.

Deliverable: tested module-entitlement lifecycle.

### Phase 5 — Roles, scopes and delegation

- Implement role templates.
- Implement role-menu and role-permission mappings.
- Implement user role assignments.
- Implement scope evaluation.
- Implement delegation ceilings and audit.

Deliverable: tested authorization policies.

### Phase 6 — Access Resolver and backend menus

- Implement centralized effective-access calculation.
- Implement or adapt `/api/v1/me/access`.
- Return the backend-generated hierarchical menu tree.
- Add access caching and invalidation.
- Ensure frontend access data cannot override backend security.

Deliverable: verified role-specific navigation and action authorization.

### Phase 7 — Administration workflows

- GeneralAdmin organization provisioning.
- Subscription and module assignment.
- Organization Admin user and role management.
- Branch-level delegated administration.
- Audit views and access-management workflows.

Deliverable: complete administrative workflows using existing AZES UI conventions.

### Phase 8 — Integration, security and acceptance

- Run authorization integration tests.
- Test tenant isolation and privilege escalation.
- Test token expiry, refresh and revocation.
- Test menu and entitlement invalidation.
- Run the repository's required architecture checks.
- Run type checks, lint, tests and production build.
- Document any remaining limitations.

Deliverable: acceptance report and migration instructions.

## 19. CURSOR EXECUTION PROTOCOL

When this document is added to the repository:

1. Read `role_system.md` completely before modifying code.
2. Inspect the current implementation and relevant repository instructions.
3. Identify the current phase and its acceptance criteria.
4. Work only on that phase unless explicitly instructed otherwise.
5. Do not silently skip requirements or tests.
6. Do not implement later phases prematurely.
7. Do not rewrite unrelated modules.
8. Prefer small, reversible changes and explicit migrations.
9. If a requirement conflicts with the existing architecture, explain the conflict and propose a resolution.
10. Ask for clarification only when a genuine architectural decision cannot be safely resolved from the repository and this document.
11. After each phase, report:
    - What was inspected.
    - What changed.
    - Files affected.
    - Database migrations.
    - Tests executed and exact results.
    - Security considerations.
    - Known limitations.
    - Recommended next phase.
12. Do not claim tests passed unless they were actually executed successfully.
13. Do not proceed to the next substantial phase until the current phase is validated and the user has had an opportunity to review it.

## 20. DEFINITION OF DONE

The architecture is acceptable only when:

- Identity and organization context are established securely.
- Unnecessary repeated identity lookups have been removed where safe.
- Token validation and revocation behavior are documented.
- Organizations and organizational units are isolated.
- Subscription entitlements control module availability.
- Roles, menus, permissions and scopes are distinct concepts.
- The backend generates each user's effective menu tree.
- Every protected API operation checks current authorization and scope.
- Delegated administrators cannot exceed their authority.
- Authorization changes invalidate stale access according to policy.
- Security-sensitive operations are audited.
- Tests verify both permitted and denied operations.
- Existing AZES conventions and working functionality are preserved.
- The implementation has a documented, phase-by-phase migration and acceptance record.

**Final architectural principle:** The token establishes a trusted identity and session context. The backend owns authorization. The registry defines available capabilities. Subscription entitlements determine organizational availability. Roles and scopes determine effective access. The backend returns the authorized menu tree, and the frontend renders it without becoming a security authority.
