<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/daily-rent.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Daily rent — separate product behavior (not deal preset only)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Daily rent (`/daily-rent`)

**Not** a thin `deal=` wrapper only. Distinct product UX.

## Wireframe

1. Hero band (daily-rent copy)
2. Stay controls: check-in / check-out, guests
3. Results: cards show **price / night**; optional total for selected dates
4. Deposit / cleaning fee rows when ViewModel has data
5. If `availability` missing: UI ready; prompt “add dates” — no fake calendar

## URL params

`checkIn`, `checkOut`, `guests` + shared filter schema. Default deal scope = daily (mapped when API supports; until then filter + mock flag).

## Data (see data-contract)

`pricePerNight`, `deposit`, `cleaningFee`, `availability?: { from, to }[]` — all optional.

## States

Empty stay selection · no availability · loading · error. Production never invents availability.
