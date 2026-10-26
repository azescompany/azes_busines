<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/analytics.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: Provider-agnostic analytics event dictionary
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Caspian Key — Analytics

Adapter: `analytics.track(event, payload)`. Provider missing → no-op + dev console. **No PII** (phone, message body, email).

## Events

| Event                | Payload (non-PII)                                                   |
| -------------------- | ------------------------------------------------------------------- |
| `listing_card_click` | `{ listingId, position?, surface }`                                 |
| `listing_view`       | `{ listingId }`                                                     |
| `filter_apply`       | `{ keys: string[], deal? }`                                         |
| `filter_clear`       | `{ keys?: string[] }`                                               |
| `search_submit`      | `{ qLength?, resultCount? }`                                        |
| `sort_change`        | `{ sort }`                                                          |
| `view_mode_change`   | `{ view: 'grid'\|'list'\|'map' }`                                   |
| `map_marker_click`   | `{ listingId }`                                                     |
| `favorite_toggle`    | `{ listingId, on: boolean }`                                        |
| `compare_add`        | `{ listingId, count }`                                              |
| `contact_click`      | `{ channel: 'phone'\|'whatsapp'\|'message', listingId?, agentId? }` |
| `lead_submit`        | `{ type, ok: boolean }` — never message/phone                       |
| `mortgage_calculate` | `{ termYears, hasPrice: boolean }`                                  |
| `share_click`        | `{ surface, method? }`                                              |
| `report_listing`     | `{ listingId, ok: boolean }`                                        |
| `error_boundary`     | `{ route, digest? }`                                                |
| `data_invalid`       | `{ domain, reason }`                                                |
| `filter_unsupported` | `{ keys: string[] }`                                                |
