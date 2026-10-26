<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/search.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Full search / discovery page design spec
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Search (`/search`)

Primary discovery surface. Sale/Rent compose presets into this URL schema.

## Wireframe

**Desktop:** collapsible filter groups (left / SidePanel) + results; Grid | List | Map.  
**Map:** split view; markers for visible listings; card↔marker highlight. **MapAdapter placeholder** until lib approved.  
**Mobile:** filter bottom sheet, badge count, sticky “Show results (N)”.

## URL filter schema (single source)

`deal, type, city, district, metro, q, priceMin, priceMax, currency, rooms, areaMin, areaMax, floor, repair, docType, sellerType, sort, view(grid|list|map), page`

- Defaults omitted from URL
- Invalid params silently stripped
- Unsupported backend keys → ignore + `filter_unsupported` analytics

## Advanced AZ filters

Price slider+inputs (AZN/USD) · rooms chips · area · floor · repair · docType · metro · district · sellerType · new/old building. Hide when meta missing.

## Empty

Suggest widen price / clear chips; optional similar listings.

## SEO

Canonical rules for filter combos; noisy combos `noindex`. Pagination URL-based.
