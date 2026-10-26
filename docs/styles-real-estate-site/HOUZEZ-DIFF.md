<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/HOUZEZ-DIFF.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Houzez vs Caspian — kept / dropped modules
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Houzez → Caspian differences

| Area                     | Houzez                | Caspian                | Why                     |
| ------------------------ | --------------------- | ---------------------- | ----------------------- |
| Chrome                   | WP + Elementor header | AZES L-shell           | Product chrome locked   |
| Skin                     | Houzez theme colors   | Caspian tokens only    | Brand                   |
| Reviews / ratings        | Often present         | **Dropped**            | No fake ratings         |
| Walkscore / Energy class | EU modules            | **Dropped**            | Not AZ market / no data |
| Create Listing           | CTA in nav            | **Dropped**            | Wrong product surface   |
| Membership packages      | Theme upsell          | **Dropped**            | N/A                     |
| Map                      | Google Maps           | MapAdapter placeholder | No lib approved yet     |
| Agents toolbar           | Often in menu         | Secondary entry only   | IA decision             |
| ListingCard click        | Full card             | Stretched link (fixed) | Bug A                   |

## Click bug (A)

**Cause:** `ListingCard` linked only image + title; body/meta not navigable.  
**Fix:** title `Link` with `::after` stretched over article; actions `z-index ≥ 2` + `stopPropagation`.
