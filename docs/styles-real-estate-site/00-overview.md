<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/00-overview.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Houzez skeleton + Caspian skin — marketplace overview
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Caspian Key — Overview (Houzez skeleton + Caspian skin)

**Live reference:** [default.houzez.co](https://default.houzez.co/)  
**Shell:** `CaspianSiteShell` + `AzesDashboardLayout` — **untouchable**  
**Home:** click/card cleanup only (§A). Internal pages follow **Houzez layout/order**; Caspian tokens only for color/radius/shadow/type.

## Design rule (locked)

| Layer                                     | Source                                             |
| ----------------------------------------- | -------------------------------------------------- |
| Page skeleton, section order, IA          | Houzez demo                                        |
| Color, radius, shadow, typography, motion | Caspian `theme.vars` / `theme.shape` / `color-mix` |
| Product chrome                            | AZES L-shell (not Houzez WP header)                |

## Content container (inside scoop)

| Rule             | Value                                                             |
| ---------------- | ----------------------------------------------------------------- |
| Scrollport       | `[data-azes-scoop]`                                               |
| Page header band | paper bg, border-bottom, low height — **not** Home cinematic hero |
| Content rhythm   | max fluid scoop padding `px: { xs: 2, md: 3, lg: 4 }`             |
| Desktop columns  | content ~8–9 / sidebar ~3–4 (listing detail, agent profile)       |
| Sticky offset    | sticky inside scoop (`top: 0` relative to scoop scroll)           |
| Section titles   | left-aligned + primary bottom accent (2px)                        |

## Houzez → Caspian mapping

| Houzez                                 | Caspian                               | Keep / drop                                |
| -------------------------------------- | ------------------------------------- | ------------------------------------------ |
| Listing v1 grid/list                   | Sale/Rent + Search `view=`            | Keep                                       |
| Half map                               | Search split + MapAdapter placeholder | Keep skeleton; no map lib yet              |
| Single Property v1                     | Listing detail                        | Keep; drop Reviews / Walkscore / EU Energy |
| All Agents v1 + Profile v1             | `/agents`, `/agents/:slug`            | Keep                                       |
| Agencies v1                            | `/agencies`                           | Keep; coming-soon if no API                |
| Contact + Inquiry                      | `/contact` + LeadForm                 | Keep                                       |
| Compare panel                          | floating + `/compare`                 | Keep                                       |
| Favorite properties                    | `/favorites`                          | Keep                                       |
| Create Listing / Packages / Membership | —                                     | **Drop** (wrong product)                   |
| Elementor marketing chrome             | —                                     | **Drop** (L-shell owns chrome)             |

## Navigation

Toolbar: Home · Sale · Rent · Daily rent · Agencies · Complexes · Mortgage.  
Agents: Home section · footer · listing agent block (not toolbar).

## ListingCard click (resolved)

**Cause:** only image + title were links; body/meta not navigable.  
**Fix:** stretched link (`title` Link + `::after` over article); favorite/compare/contact `z-index: 2+` + `stopPropagation`.

## Page docs

See sibling `*.md` files for Houzez URLs, section order, responsive, states.
