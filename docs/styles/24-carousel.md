<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/24-carousel.md
║ Author: AZES_COMPANY
║ Created: 2026-10-10
║ Updated: 2026-10-10
║ Purpose: AzesCarousel API, scroll-snap behavior, a11y, tokens
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AzesCarousel

Global image gallery for pages and dialogs (real-estate style). Implemented with **native CSS
`scroll-snap`** and a small React controller — **no** Swiper, Embla, Slick, or other slider
dependencies (keeps the core `@azes/ui-web` bundle light; touch swipe is browser-native).

## Import

```ts
import {
  AzesCarousel,
  DEFAULT_AZES_CAROUSEL_LABELS,
  type AzesCarouselImage,
  type AzesCarouselProps,
} from '@azes/ui-web';
```

## API (summary)

| Prop                      | Default                                       | Notes                                                        |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| `images`                  | —                                             | `{ src, alt?, thumbSrc?, srcSet?, sizes? }[]`                |
| `title`                   | —                                             | Region label + alt fallback                                  |
| `index` / `onIndexChange` | uncontrolled                                  | Controlled mode when `index` is set                          |
| `initialIndex`            | `0`                                           | Uncontrolled start                                           |
| `aspectRatio`             | `theme.azes.carousel.aspectRatio` (`16 / 10`) | Always applied (no CLS)                                      |
| `fit`                     | `'cover'`                                     | Use `'contain'` in lightbox                                  |
| `showThumbnails`          | `true`                                        | Desktop strip; mobile uses dots                              |
| `showArrows`              | `true`                                        | Hidden below `sm` (swipe)                                    |
| `showCounter`             | `true`                                        | `3 / 12` pill                                                |
| `showFullscreen`          | `false`                                       | Internal MUI `Modal` lightbox (not AzesDialog)               |
| `loop`                    | `false`                                       |                                                              |
| `autoPlay`                | `false`                                       | ms interval; pauses on hover/focus; off under reduced-motion |
| `priority`                | `false`                                       | First (+ near) slides `loading="eager"`                      |
| `variant`                 | `'outlined'`                                  | `'plain'` for dialog edge-to-edge                            |
| `labels`                  | English defaults                              | Inject from app i18n                                         |

Empty `images` → placeholder. Single image → arrows / thumbs / counter hidden.

## Behavior

- Track: `scroll-snap-type: x mandatory`; `scrollTo` with `smooth` unless `prefers-reduced-motion`.
- Active index via `IntersectionObserver` (updates only when the index changes).
- Navigation: arrows, thumbnails (auto-scroll into view), touch swipe, keyboard ← → Home/End
  (RTL-aware). No mouse drag.
- Lazy load: active ±1 (and priority first); others `loading="lazy"` + `decoding="async"`.
- Per-slide skeleton + error fallback (broken image does not break the gallery).
- Lightbox Esc closes the lightbox first; does not depend on `useAzesDialog`.

## Tokens

`theme.azes.carousel`: `aspectRatio`, `arrowSize`, `thumbSize`, `thumbGap`, `surfaceMixPercent`,
`counterTypography`. Styles live in `carouselStyles.ts` (`getCarouselRootSx`, …); user `sx`
merges last.

## a11y

- Root: `role="region"`, `aria-roledescription="carousel"`, `aria-label`.
- Slides: `role="group"`, `aria-roledescription="slide"`, `aria-label="i / n"`.
- Arrows / thumbs labeled; `aria-current` on active thumb; polite live status on user nav.

## Page + dialog examples

```tsx
<AzesCarousel images={images} title={title} showFullscreen />

await dialog.open({
  variant: 'custom',
  title: 'Listing details',
  maxWidth: 'lg',
  fullScreenOnMobile: true,
  showCloseButton: true,
  hideFooter: true,
  paddingless: true,
  icon: false,
  content: <AdDetailsContent … />,
});
```

Admin Ads: photo / address cells open this pattern; details load via `GET /api/v1/data/{id}`.

## Design Lab

`#/auth-lab` — AzesCarousel section (0/1/3/12) + “Gallery dialog” under AzesDialog.
