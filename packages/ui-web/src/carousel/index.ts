/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public entry for AzesCarousel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { AzesCarousel } from './AzesCarousel';
export {
  DEFAULT_AZES_CAROUSEL_LABELS,
  formatCarouselLabel,
  type AzesCarouselImage,
  type AzesCarouselLabels,
  type AzesCarouselProps,
  type AzesCarouselVariant,
} from './types';
export { getCarouselRootSx, getCarouselTrackSx, type CarouselStyleOptions } from './carouselStyles';
