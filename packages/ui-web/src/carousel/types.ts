/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-10
 * ║ Purpose: Public types and default labels for AzesCarousel
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

export type AzesCarouselImage = {
  src: string;
  alt?: string;
  thumbSrc?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

export type AzesCarouselLabels = {
  /** Root region aria-label fallback when `title` is omitted. */
  carousel: string;
  previous: string;
  next: string;
  /** Pattern with {{current}} and {{total}} (1-based). */
  slideOf: string;
  empty: string;
  fullscreen: string;
  closeFullscreen: string;
  /** Live region pattern when the user changes slides. */
  status: string;
};

export const DEFAULT_AZES_CAROUSEL_LABELS: AzesCarouselLabels = {
  carousel: 'Image gallery',
  previous: 'Previous image',
  next: 'Next image',
  slideOf: '{{current}} / {{total}}',
  empty: 'No images',
  fullscreen: 'View fullscreen',
  closeFullscreen: 'Close fullscreen',
  status: 'Image {{current}} of {{total}}',
};

export type AzesCarouselVariant = 'outlined' | 'plain';

export type AzesCarouselProps = {
  images: AzesCarouselImage[];
  title?: string;
  initialIndex?: number;
  index?: number;
  onIndexChange?: (index: number) => void;
  aspectRatio?: string;
  fit?: 'cover' | 'contain';
  showThumbnails?: boolean;
  showArrows?: boolean;
  showCounter?: boolean;
  showFullscreen?: boolean;
  loop?: boolean;
  autoPlay?: false | number;
  priority?: boolean;
  onImageClick?: (index: number) => void;
  emptyState?: ReactNode;
  variant?: AzesCarouselVariant;
  labels?: Partial<AzesCarouselLabels>;
  sx?: SxProps<Theme>;
};

export function formatCarouselLabel(template: string, current: number, total: number): string {
  return template
    .replace(/\{\{current\}\}/g, String(current))
    .replace(/\{\{total\}\}/g, String(total));
}
