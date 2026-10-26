<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/azes-ui/README.md
║ Author: AZES_COMPANY
║ Created: 2026-09-29
║ Updated: 2026-10-19
║ Purpose: Runbook for the AZES design-system showcase
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# @azes/azes-ui

Design-system showcase for the web theme. Dev port: **7777**.

```bash
pnpm --filter @azes/azes-ui dev
```

Components come from `@azes/ui-web`. Icons come from `@azes/ui-web/icons`. Layout, navigation
and settings come from the matching subpaths. Pilot pages live under `#/pages-*`.

## AI assistant (Nemotron)

The rail AI sheet chats through a **Vite server proxy** (`POST /api/ai/chat`). The NVIDIA key
never enters the browser bundle — do **not** use a `VITE_` prefix.

1. Copy `.env.example` → `.env` (must be `KEY=value` lines — **not** a curl script)
2. Set `NVIDIA_API_KEY` (and optionally `NVIDIA_API_URL` / `NVIDIA_MODEL`)
3. Behind corporate TLS inspection, set `NVIDIA_TLS_INSECURE=1` (local only)
4. Restart `pnpm --filter @azes/azes-ui dev` after any `.env` change

Grounding uses the curated pack in `server/knowledge/chunks.json` plus a strict system prompt.
When docs change, update those chunks (and keep answers scoped to AZES / azes-ui).
