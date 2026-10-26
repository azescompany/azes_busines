<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles-current/homepage-assets.md
║ Author: AZES_COMPANY
║ Created: 2026-10-13
║ Updated: 2026-10-15
║ Purpose: Attribution and status for Caspian Key homepage visuals
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Homepage assets — Caspian Key

## Status

Demo listing/agent photos are **local JPGs** from [picsum.photos](https://picsum.photos)
seeds. Houzez / default.houzez.co media is **not** used.

## What ships (active)

Under `apps/real-estate-site/public/home/`:

| Path                                  | Role                                   | Notes                                                   |
| ------------------------------------- | -------------------------------------- | ------------------------------------------------------- |
| `/home/photos/baku-flame-towers.jpg`  | Hero slide 1                           | Flame Towers night skyline (2560×1440)                  |
| `/home/photos/baku-heydar-aliyev.jpg` | Hero slide 2                           | Heydar Aliyev Center daytime (2560×1440)                |
| `/home/photos/baku-crescent-mall.jpg` | Hero slide 3                           | Crescent Mall / Port Baku towers (2560×1440)            |
| `/home/photos/baku-night-01.jpg`      | Area card (Yasamal)                    | Night boulevard                                         |
| `/home/photos/baku-night-02.jpg`      | Area card (Nərimanov)                  | Night towers                                            |
| `/home/photos/baku-skyline.jpg`       | Area card (Səbail)                     | Day skyline                                             |
| `/home/photos/baku-caspian-01.jpg`    | Area card (Nəsimi)                     | Caspian waterfront                                      |
| `/home/photos/luxury-interior.jpg`    | Promo fixed-band (`HomePromoBand`)     | Living-room interior                                    |
| `/home/photos/luxury-home.jpg`        | Inquiry fixed-band (`HomeInquiryBand`) | Villa exterior                                          |
| `/home/photos/types/*.jpg`            | Property-type bento tiles              | apartment / house / office / garage / land / commercial |
| `/home/photos/p01.jpg` … `p12.jpg`    | Listing + complex covers               | picsum demo                                             |
| `/home/photos/a01.jpg` … `a10.jpg`    | Agent avatars / agency logos           | picsum demo                                             |

**Hero behaviour:** `HeroVideo` loops Flame Towers → Heydar Aliyev → Crescent Mall with
Ken Burns + soft crossfade. `prefers-reduced-motion: reduce` → first slide static only.

## Removed (2026-10-15)

| Path                  | Reason                            |
| --------------------- | --------------------------------- |
| `baku-hero-01…03.jpg` | Replaced by named landmark heroes |
| `hero.jpg`            | Unused legacy poster              |
| `promo.jpg`           | Unused legacy promo               |

## Forbidden

- Houzez theme/media/copy
- Remote Unsplash hotlinks in runtime mocks
