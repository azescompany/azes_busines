<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/sale.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Sale page — Houzez Listing v1 + For Sale status
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Sale (`/sale`)

**Houzez refs:** [/listing-v1-grid/](https://default.houzez.co/listing-v1-grid/), [/status/for-sale/](https://default.houzez.co/status/for-sale/), list / full-width / with-tabs variants.

## Section order

1. PageHeaderBand (breadcrumb Home › For sale, title, result count)
2. Horizontal filter strip (keyword, type, city, rooms, price, Search + More filters)
3. Toolbar: count · Sort · Grid/List · Map
4. ActiveFilterChips
5. ListingGrid / list cards
6. Infinite scroll (`pageSize: 8`, IntersectionObserver; filters stay in URL)
7. Lead CTA band (“Need help?”)

## Caspian skin

Tokens only. Preset `deal=sale` via DealScopedSearchView.

## Dropped from Houzez

Elementor sidebar widgets, WP membership CTAs.
