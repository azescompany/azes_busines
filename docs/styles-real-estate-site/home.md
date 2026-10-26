<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/home.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Home page design reference (implemented — do not redesign)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Home (`/`) — visual reference (implemented)

**Status:** Shipped. **Do not modify** `HomeView` except approved bug fixes. All other pages inherit this language.

## Section order

1. Cinematic hero (`HeroVideo` Ken Burns) + CTA + glass value cards
2. Featured listings (`ListingGrid` 4-col teaser ×8 + “Daha çox” → `/search`)
3. `ParallaxBand` promo (buy/sell/rent)
4. Property types `LoopSlideRail` → `/search?type=`
5. Areas reverse rail → `/search?city=&q=`
6. Agents grid → `/agents/:slug` (hidden in agent mode)
7. Testimonials

Separators: `DiagonalDivider`. Section backgrounds full-bleed; copy/grids in
`AzesContentRail` (settings Fixed/Fluid). Shell: home `constrain: false` +
`disablePadding`.

## States

Skeleton: `HomeViewSkeleton`. Error: Alert + retry. Empty agents: section hide.

## SEO

Title/description from i18n; Organization JSON-LD if present — do not invent ratings.

## Analytics

`listing_card_click` (surface: home), CTA clicks via existing links.
