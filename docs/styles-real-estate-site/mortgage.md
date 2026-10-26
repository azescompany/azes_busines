<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/mortgage.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Mortgage calculator + lead page design spec
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Mortgage (`/mortgage`)

## Sections

1. `ParallaxBand`-style hero
2. Calculator: price, down payment %, term years, annual rate → monthly, total, interest (annuity; unit-tested)
3. Slider ↔ input sync; state in URL (shareable)
4. Collapsible amortization table (`dynamic()`)
5. Rates from config (not hardcoded magic in UI copy); i18n “estimate only” disclaimer
6. `LeadForm` type `mortgage`

## Analytics

`mortgage_calculate`, `lead_submit`.
