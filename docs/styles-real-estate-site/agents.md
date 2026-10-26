<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/agents.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Agents directory design spec
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Agents directory (`/agents`)

**Not in toolbar.** Entry: Home section, footer, listing agent block.

## Wireframe

Hero band · search/filter (district, language, specialty when data) · avatar card grid (verified, listing count) · card → `/agents/:slug`.

Avatar fallback: mesh gradient + monogram (Home quality).

## Agent mode

Directory **hidden** (`isAgentMode`).

## Data

`AgentViewModel[]` via `AgentRepository` (mock until public API — STOP).
