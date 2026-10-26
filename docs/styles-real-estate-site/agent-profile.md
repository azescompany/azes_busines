<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/agent-profile.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Agent profile page design spec
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Agent profile (`/agents/:slug`)

## Sections

Header (avatar, name, agency, contact CTAs, socials, bio, languages) · stats from real data only · scoped `ListingGrid` by **`agentId`** (not name match) · `LeadForm` type `agent_inquiry`.

## States

Not found · empty listings · loading skeleton · error retry.

## SEO

JSON-LD `RealEstateAgent` / `Person`; no fake ratings.
