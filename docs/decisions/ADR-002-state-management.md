<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/decisions/ADR-002-state-management.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Decision record for state management split
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# ADR-002: TanStack Query for server state, Redux Toolkit for client state

## Context

Apps need robust remote-data handling and a smaller amount of genuine global client state.

## Problem

Using one tool for everything leads to either reinventing caching (Redux) or misusing a cache as
global state (Query).

## Options considered

- TanStack Query + Redux Toolkit (split)
- Redux Toolkit + RTK Query only
- Zustand/Jotai for client state
- Query only

## Decision

**TanStack Query owns server state; Redux Toolkit owns justified client/global state.** API data
does not go into Redux without a documented reason.

## Why

- Query provides caching, retries, pagination, mutations, invalidation out of the box.
- RTK is a mature, well-typed solution for cross-route client state and persistence.
- Clear ownership prevents duplicated/derived state bugs.

## Consequences

- `packages/api` hosts Query hooks; `packages/state` hosts RTK slices.
- A documented "must NOT enter Redux" list is enforced in review.

## Status

Accepted.
