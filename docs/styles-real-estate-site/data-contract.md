<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-real-estate-site/data-contract.md
║ Author: AZES_COMPANY
║ Created: 2026-10-14
║ Updated: 2026-10-14
║ Purpose: ViewModel ↔ DTO contract + STOP blockers for public API
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Caspian Key — Data Contract

UI sees **ViewModels only**. API/DTO field names never appear in components.

Current listing source (temporary): `POST /api/v1/ad/all/table` (Bearer). Public/anon endpoints TBD.

---

## 1. ListingViewModel

| Field              | Type                          | Nullable | Current DTO source        | Public API expectation       |
| ------------------ | ----------------------------- | -------- | ------------------------- | ---------------------------- |
| id                 | string                        | no       | `AdTableResponse.id`      | stable public id             |
| slug               | string                        | no       | derived / title           | SEO slug                     |
| title              | string                        | no       | mapped from type+address  | title                        |
| description        | string                        | yes      | (often empty today)       | full description             |
| dealType           | `'sale'\|'rent'\|'daily'`     | no       | `addType` / text          | enum                         |
| propertyType       | enum                          | no       | `propertyTypeName`        | enum/code                    |
| price.amount       | number                        | no       | `price`                   | money                        |
| price.currency     | `'AZN'\|'USD'`                | no       | assumed AZN               | currency                     |
| pricePerNight      | number                        | yes      | —                         | daily rent                   |
| deposit            | number                        | yes      | —                         | daily rent                   |
| cleaningFee        | number                        | yes      | —                         | daily rent                   |
| rooms              | number                        | yes      | `rooms`                   |                              |
| bathrooms          | number                        | yes      | —                         |                              |
| areaM2             | number                        | no       | `area`                    |                              |
| floor              | number                        | yes      | `stage`                   |                              |
| floorsTotal        | number                        | yes      | `stages`                  |                              |
| city               | string                        | no       | `cityName`                |                              |
| district           | string                        | yes      | —                         |                              |
| metro              | string                        | yes      | —                         | **STOP field**               |
| addressLine        | string                        | yes      | `address`                 |                              |
| lat / lng          | number                        | no       | `location`                |                              |
| imageUrls          | string[]                      | no       | `baseUrl` + attachments   | CDN URLs                     |
| features           | string[]                      | no       | —                         | amenities                    |
| repair             | string                        | yes      | —                         | **STOP field**               |
| docType            | string                        | yes      | —                         | **STOP field** kupça/çıxarış |
| buildingAge        | `'new'\|'old'`                | yes      | —                         | **STOP field**               |
| sellerType         | `'owner'\|'broker'\|'agency'` | yes      | —                         | **STOP field**               |
| agentId            | string                        | no       | `ownerId` (stable FK)     | agent FK — **no name match** |
| agentSlug          | string                        | yes      | derived                   |                              |
| phone / email      | string                        | yes      | `phone1`/`phone2`         |                              |
| ownerName          | string                        | yes      | `ownerName`               | display only                 |
| publishedAt        | ISO string                    | no       | `postedDate`/`createDate` |                              |
| updatedAt          | ISO string                    | yes      | —                         | “N days ago”                 |
| featured           | boolean                       | no       | —                         |                              |
| verifiedAgent      | boolean                       | yes      | —                         | **STOP field**               |
| listingNumber      | string                        | yes      | id                        | copyable ref                 |
| availability       | `{ from, to }[]`              | yes      | —                         | daily rent **STOP**          |
| videoUrl / tourUrl | string                        | yes      | —                         |                              |

**Mapper rules:** invalid row → skip + `mapperWarnings` + analytics `data_invalid`. Never crash the page.

---

## 2. AgentViewModel (domain C)

| Field                 | Type     | Nullable | Current       | Public API   |
| --------------------- | -------- | -------- | ------------- | ------------ |
| id                    | string   | no       | mock / future | **required** |
| slug                  | string   | no       | mock          | unique slug  |
| name                  | string   | no       | mock          |              |
| title                 | string   | yes      | mock          | job title    |
| phone / email         | string   | yes      | mock          |              |
| city / district       | string   | yes      | mock          |              |
| bio                   | string   | yes      | mock          |              |
| languages             | string[] | no       | mock          |              |
| specialties           | string[] | yes      | —             |              |
| listingCount          | number   | no       | computed/mock |              |
| avatarUrl             | string   | yes      | mock          |              |
| agencyId / agencyName | string   | yes      | —             |              |
| socials               | record   | yes      | —             |              |
| verified              | boolean  | yes      | —             |              |
| featured              | boolean  | no       | mock          |              |

**STOP:** No Agent tag/endpoints in OpenAPI today. Keep `AgentRepository` + `mockAgentRepository`. Do **not** invent endpoints. Link listings via `agentId === ownerId` string (same id space in mock seed).

---

## 3. AgencyViewModel / ComplexViewModel

Phase 2 surfaces. Mock + feature flag. Production may show “coming soon” when flag off / API missing.

| Agency                                                  | Complex                                                   |
| ------------------------------------------------------- | --------------------------------------------------------- |
| id, slug, name, logoUrl, agentCount, listingCount, city | id, slug, name, coverUrl, listingCount, buildStatus, city |

---

## 4. FilterMetaViewModel

Cities, districts, metro stations, property types, doc types — for filter chips. Today mostly static/i18n; public filterMeta endpoint **STOP**.

---

## 5. LeadViewModel → submit

| Field                       | Notes                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| type                        | `contact` \| `viewing_request` \| `callback` \| `mortgage` \| `report_listing` \| `agent_inquiry` |
| listingId / agentId         | optional context                                                                                  |
| name, phone (+994), message | validated                                                                                         |
| consent                     | required checkbox                                                                                 |
| honeypot + filledAtMs       | spam guards                                                                                       |

**STOP:** No lead endpoint. Dev mock may toast; **production must not fake success** — disable submit + show phone fallback.

---

## 6. DATA_SOURCE

| Env                             | Behavior                                              |
| ------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_DATA_SOURCE=mock`  | mock repos (non-prod)                                 |
| `NEXT_PUBLIC_DATA_SOURCE=api`   | API repos                                             |
| unset + `apiBaseUrl` + non-prod | api with mock fallback on 401/network                 |
| production                      | **never** serve mock listings; error state on failure |

---

## 7. STOP report (backend needs)

1. **Public/anon listings** — browse without Bearer (or documented public token).
2. **Agent CRUD + public list/detail** — domain C.
3. **Lead/inquiry submit** endpoint.
4. **filterMeta** (metro, docType, repair, sellerType).
5. **Agencies / complexes** public list.
6. **Daily availability** calendar (optional).
7. **Map library** — Ask-first (Leaflet/Mapbox); UI uses `MapAdapter` placeholder until approved.
