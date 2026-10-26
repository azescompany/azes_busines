/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/carouselScroll.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Scroll-position helpers for AzesCarousel track snaps
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Viewport-relative left that aligns `slide` with the track's visible origin. */
export function carouselScrollLeftForSlide(
  track: Pick<HTMLElement, 'scrollLeft' | 'getBoundingClientRect'>,
  slide: Pick<HTMLElement, 'getBoundingClientRect'>,
): number {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  return track.scrollLeft + (slideRect.left - trackRect.left);
}

/** Non-adjacent jumps must snap instantly so IO cannot steal mid-animation. */
export function carouselScrollBehaviorForDistance(
  distance: number,
  reducedMotion: boolean,
): ScrollBehavior {
  if (reducedMotion || distance > 1) return 'auto';
  return 'smooth';
}
