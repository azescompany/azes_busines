<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/31-login-shell.md
║ Author: AZES_COMPANY
║ Created: 2026-10-11
║ Updated: 2026-10-20
║ Purpose: Account login Chrome & Canvas shell
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Login shell — Chrome & Canvas (account)

Living topic for `:5173` login. Snapshot: [CURRENT-STATE.md](CURRENT-STATE.md).  
`23` is [dialog](23-dialog.md); photo-hero notes in [30-login-hero.md](30-login-hero.md) are
**superseded**.

**Product copy (2026-10-20):** i18n brand/showcase strings are **AZES Academy / LMS**
(courses, learners, progress). Visual shell, tokens, and card layouts are unchanged —
only locale strings (+ map pin letters V/Q/A/C).

## Concept

```text
Chrome (var(--azes-nav-bg))
├── Showcase (desktop ≥ lg) — logo, product copy, 5 fan cards
└── Canvas (paper) — language (only here), form + static labels, security, footer
```

No env/platform chip. No chrome language menu (mobile header is logo-only).

## Form labels

Login fields use **static** `InputLabel` above a `hiddenLabel` outlined input (no floating notch).  
Root cause of the struck-through label was tinted `backgroundColor` on `MuiOutlinedInput-root`
fighting the notched legend. Login-only structural fix (admin forms unchanged).  
Both fields share the same `controlHeight` + `body1` input typography. Focus = `border.focus`
width 2 + weak `color-mix` glow (single ring). Username: `spellCheck={false}`,
`autoCapitalize/autoCorrect=off`, `autoComplete=username`.

## Showcase cards (5)

Under `features/login/components/LoginShowcase/cards/`, each in `LoginShowcaseCard`
(paper, border, static shadow layer):

1. **listings** — window chrome, chips, 2×2 course tiles (copy: courses/progress)
2. **stats** — KPI tiles, area/line chart, donut, pipeline bars (learners/certs)
3. **agent** — abstract avatar, rating, stats, CTA shapes (instructor profile)
4. **map** — shoreline, streets, radius pin, lesson-type pins (V/Q/A/C), chips
5. **deals** — 3-column kanban (new / in progress / completed)

Idle: fan stack with slow float (`transform` only). Short height / narrower desktop: 2–3 cards
conditionally mounted. Motions stop when success transition starts.

## Success timeline

Controller: `useLoginSuccessTransition`  
Phases: `idle → collapsing → expanding → scattering → settled → hold → exiting → redirecting`

| Step           | Motion                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| collapsing     | form/canvas `opacity` (+ slight `translateY` on form)                            |
| expanding      | showcase full viewport; `clip-path` L→R (`canvasPercent` inset; RTL mirrored)    |
| scattering     | cards fly to asymmetric poses (`loginShellScatter.ts` `--tx/--ty/--rot/--scale`) |
| scattering     | cards fly out; **logo rises at the same time** (no delay)                        |
| settled → hold | auto hold `holdDurationMs` (3s) / `holdReducedMs` — no Skip button               |
| exiting        | wash to admin loader tokens; cards fade                                          |
| redirect       | after hold + exit; always covered by `fallbackRedirectMs`                        |

**Phone:** idle shows form only. On success, form fades and a full-viewport `layout="overlay"`
showcase mounts (compact 3-card scatter + logo), then the same auto hold → admin.

**Animated only:** `transform`, `opacity`, `clip-path`.  
**Not animated:** box-shadow blur values, filters, gradients, width/left/top.  
`will-change` only while active; idle parallax/float listeners removed on transition start.

Mobile (no showcase): form fade → logo rise + welcome → hold → exit → redirect.

## Tokens

`theme.azes.loginShell` — panel %, expand/scatter/logo/hold/exit durations, easings,
`fallbackRedirectMs` (≥ hold + motion budget).

## Language

Single `LanguageMenu` on canvas (`tone="onPaper"`). `tone="onChrome"` remains on the component
API for reuse but is unused on login chrome.

## A11y

One `h1`; `main`; decorative cards `aria-hidden`; security `aria-expanded`; hold skip announced;
`prefers-reduced-motion` skips expand/scatter/float.
