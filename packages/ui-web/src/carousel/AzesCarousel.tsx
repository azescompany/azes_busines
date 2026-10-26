/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/carousel/AzesCarousel.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-11
 * ║ Purpose: Native scroll-snap image carousel for pages and dialogs
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type SyntheticEvent,
} from 'react';

import { IconArrowBack, IconArrowForward, IconClose, IconFullscreen, IconImage } from '../icons';
import {
  getCarouselArrowSx,
  getCarouselChromeOverlaySx,
  getCarouselCounterSx,
  getCarouselDotSx,
  getCarouselDotsSx,
  getCarouselEmptySx,
  getCarouselFullscreenBtnSx,
  getCarouselImageSx,
  getCarouselLightboxPaperSx,
  getCarouselRootSx,
  getCarouselSlideSx,
  getCarouselThumbBtnSx,
  getCarouselThumbStripSx,
  getCarouselTrackSx,
} from './carouselStyles';
import { carouselScrollBehaviorForDistance, carouselScrollLeftForSlide } from './carouselScroll';
import {
  DEFAULT_AZES_CAROUSEL_LABELS,
  formatCarouselLabel,
  type AzesCarouselLabels,
  type AzesCarouselProps,
} from './types';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}

function resolveLabels(partial?: Partial<AzesCarouselLabels>): AzesCarouselLabels {
  return { ...DEFAULT_AZES_CAROUSEL_LABELS, ...partial };
}

type SlideImageProps = {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  eager: boolean;
  onClick?: () => void;
};

function SlideImage({ src, alt, srcSet, sizes, eager, onClick }: SlideImageProps) {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Box
        sx={{
          ...getCarouselEmptySx(theme),
          aspectRatio: 'unset',
          height: '100%',
        }}
        aria-hidden
      >
        <IconImage fontSize="large" />
      </Box>
    );
  }

  return (
    <>
      {!loaded ? (
        <Skeleton
          variant="rounded"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            bgcolor: `color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, ${theme.vars.palette.background.muted})`,
          }}
        />
      ) : null}
      <Box
        component="img"
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        onClick={onClick}
        sx={{
          ...getCarouselImageSx(),
          opacity: loaded ? 1 : 0,
          cursor: onClick ? 'pointer' : 'default',
        }}
      />
    </>
  );
}

export function AzesCarousel({
  images,
  title,
  initialIndex = 0,
  index: controlledIndex,
  onIndexChange,
  aspectRatio,
  fit = 'cover',
  showThumbnails = true,
  showArrows = true,
  showCounter = true,
  showFullscreen = false,
  loop = false,
  autoPlay = false,
  priority = false,
  onImageClick,
  emptyState,
  variant = 'outlined',
  labels: labelsProp,
  sx,
}: AzesCarouselProps) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const labels = resolveLabels(labelsProp);
  const regionId = useId();
  const liveId = useId();

  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(() =>
    clampIndex(initialIndex, images.length),
  );
  const activeIndex = clampIndex(
    isControlled ? (controlledIndex as number) : uncontrolledIndex,
    images.length,
  );

  const [liveMessage, setLiveMessage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Record<number, boolean>>({});

  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const programmaticScroll = useRef(false);
  const pendingTargetRef = useRef<number | null>(null);
  const scrollSessionRef = useRef(0);
  const scrollUnlockTimerRef = useRef<number | null>(null);
  const scrollEndHandlerRef = useRef<(() => void) | null>(null);
  const skipScrollSyncRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const count = images.length;
  const multi = count > 1;
  const effectiveAspect = aspectRatio ?? theme.azes.carousel.aspectRatio;

  const setActiveIndex = useCallback(
    (next: number, announce = false) => {
      const clamped = clampIndex(next, images.length);
      if (!isControlled) {
        setUncontrolledIndex((prev) => (prev === clamped ? prev : clamped));
      }
      if (clamped !== activeIndexRef.current) {
        onIndexChange?.(clamped);
      }
      if (announce) {
        setLiveMessage(formatCarouselLabel(labels.status, clamped + 1, images.length));
      }
    },
    [images.length, isControlled, labels.status, onIndexChange],
  );

  const clearScrollUnlockTimer = useCallback(() => {
    if (scrollUnlockTimerRef.current != null) {
      window.clearTimeout(scrollUnlockTimerRef.current);
      scrollUnlockTimerRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback(
    (target: number, behavior: ScrollBehavior = 'auto') => {
      const el = trackRef.current;
      const slide = slideRefs.current[target];
      if (!el || !slide) return;

      clearScrollUnlockTimer();
      if (scrollEndHandlerRef.current) {
        el.removeEventListener('scrollend', scrollEndHandlerRef.current);
        scrollEndHandlerRef.current = null;
      }

      const session = ++scrollSessionRef.current;
      programmaticScroll.current = true;
      pendingTargetRef.current = target;

      const reduced = prefersReducedMotion();
      const finalBehavior = reduced ? 'auto' : behavior;
      const left = carouselScrollLeftForSlide(el, slide);

      el.scrollTo({ left, behavior: finalBehavior });

      const unlock = () => {
        if (session !== scrollSessionRef.current) return;
        clearScrollUnlockTimer();
        if (scrollEndHandlerRef.current) {
          el.removeEventListener('scrollend', scrollEndHandlerRef.current);
          scrollEndHandlerRef.current = null;
        }

        // Snap-correct only — never write index here (stale unlocks must not clobber goTo).
        const track = trackRef.current;
        const slideEl = slideRefs.current[target];
        if (track && slideEl && pendingTargetRef.current === target) {
          const delta = carouselScrollLeftForSlide(track, slideEl) - track.scrollLeft;
          if (Math.abs(delta) > 1) {
            track.scrollTo({ left: track.scrollLeft + delta, behavior: 'auto' });
          }
        }

        programmaticScroll.current = false;
        pendingTargetRef.current = null;
      };

      if (finalBehavior === 'auto') {
        requestAnimationFrame(() => {
          requestAnimationFrame(unlock);
        });
        return;
      }

      scrollEndHandlerRef.current = unlock;
      el.addEventListener('scrollend', unlock);
      scrollUnlockTimerRef.current = window.setTimeout(unlock, 600);
    },
    [clearScrollUnlockTimer],
  );

  const goTo = useCallback(
    (next: number, announce = true) => {
      let target = next;
      if (loop && count > 0) {
        if (next < 0) target = count - 1;
        else if (next >= count) target = 0;
      } else {
        target = clampIndex(next, count);
      }
      const from = activeIndexRef.current;
      const distance = Math.abs(target - from);
      const behavior = carouselScrollBehaviorForDistance(distance, prefersReducedMotion());
      // Invalidate any in-flight unlock before index changes.
      clearScrollUnlockTimer();
      scrollSessionRef.current += 1;
      pendingTargetRef.current = target;
      programmaticScroll.current = true;
      if (target !== from) {
        skipScrollSyncRef.current = true;
      }
      setActiveIndex(target, announce);
      // Wait one frame so destination slide mounts before measuring scroll.
      requestAnimationFrame(() => {
        scrollToIndex(target, behavior);
      });
    },
    [clearScrollUnlockTimer, count, loop, scrollToIndex, setActiveIndex],
  );

  const goPrev = useCallback(
    (announce = true) => {
      goTo(activeIndexRef.current - (isRtl ? -1 : 1), announce);
    },
    [goTo, isRtl],
  );

  const goNext = useCallback(
    (announce = true) => {
      goTo(activeIndexRef.current + (isRtl ? -1 : 1), announce);
    },
    [goTo, isRtl],
  );

  useEffect(() => {
    if (skipScrollSyncRef.current) {
      skipScrollSyncRef.current = false;
      return;
    }
    scrollToIndex(activeIndex, 'auto');
  }, [activeIndex, count, scrollToIndex]);

  useEffect(() => () => clearScrollUnlockTimer(), [clearScrollUnlockTimer]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current || pendingTargetRef.current != null) {
          return;
        }
        let best: { index: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.slideIndex);
          if (Number.isNaN(idx)) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { index: idx, ratio: entry.intersectionRatio };
          }
        }
        if (best && best.index !== activeIndexRef.current) {
          setActiveIndex(best.index);
        }
      },
      { root: track, threshold: [0.55, 0.75] },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [count, setActiveIndex]);

  useEffect(() => {
    if (!showThumbnails || isMobile || !multi) return;
    const strip = thumbStripRef.current;
    const thumb = strip?.querySelector<HTMLElement>(`[data-thumb-index="${activeIndex}"]`);
    if (!strip || !thumb) return;
    // Adjust strip scroll only — avoid scrollIntoView (can scroll dialog ancestors).
    const reduced = prefersReducedMotion();
    const stripRect = strip.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const overflowLeft = thumbRect.left - stripRect.left;
    const overflowRight = thumbRect.right - stripRect.right;
    let delta = 0;
    if (overflowLeft < 0) delta = overflowLeft;
    else if (overflowRight > 0) delta = overflowRight;
    if (delta === 0) return;
    strip.scrollBy({ left: delta, behavior: reduced ? 'auto' : 'smooth' });
  }, [activeIndex, isMobile, multi, showThumbnails]);

  useEffect(() => {
    if (!autoPlay || !multi || lightboxOpen) return;
    if (prefersReducedMotion()) return;
    let paused = false;
    const root = rootRef.current;
    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    root?.addEventListener('mouseenter', onEnter);
    root?.addEventListener('mouseleave', onLeave);
    root?.addEventListener('focusin', onEnter);
    root?.addEventListener('focusout', onLeave);

    const id = window.setInterval(() => {
      if (paused) return;
      const current = activeIndexRef.current;
      const next = current + 1;
      if (next >= count) {
        if (loop) goTo(0, true);
      } else {
        goTo(next, true);
      }
    }, autoPlay);

    return () => {
      window.clearInterval(id);
      root?.removeEventListener('mouseenter', onEnter);
      root?.removeEventListener('mouseleave', onLeave);
      root?.removeEventListener('focusin', onEnter);
      root?.removeEventListener('focusout', onLeave);
    };
  }, [autoPlay, count, goTo, lightboxOpen, loop, multi]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!multi) return;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (isRtl) goNext();
        else goPrev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (isRtl) goPrev();
        else goNext();
        break;
      case 'Home':
        event.preventDefault();
        goTo(0);
        break;
      case 'End':
        event.preventDefault();
        goTo(count - 1);
        break;
      default:
        break;
    }
  }

  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= count - 1;
  const prevDisabled = !loop && atStart;
  const nextDisabled = !loop && atEnd;

  const rootSx = [
    getCarouselRootSx(theme, {
      variant,
      aspectRatio: effectiveAspect,
      fit,
      showArrows: showArrows && multi,
    }),
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  const regionLabel = title?.trim() || labels.carousel;

  if (count === 0) {
    return (
      <Box
        ref={rootRef}
        data-azes-carousel-root=""
        role="region"
        aria-roledescription="carousel"
        aria-label={regionLabel}
        sx={rootSx}
      >
        {emptyState ?? (
          <Box sx={getCarouselEmptySx(theme)}>
            <IconImage aria-hidden />
            <span>{labels.empty}</span>
          </Box>
        )}
      </Box>
    );
  }

  const maxDots = 5;
  let dotStart = 0;
  if (count > maxDots) {
    dotStart = Math.min(Math.max(0, activeIndex - Math.floor(maxDots / 2)), count - maxDots);
  }
  const visibleDots = Array.from({ length: Math.min(count, maxDots) }, (_, i) => dotStart + i);

  const currentImage = images[activeIndex];
  const currentAlt =
    currentImage?.alt?.trim() ||
    (title
      ? `${title} — ${formatCarouselLabel(labels.slideOf, activeIndex + 1, count)}`
      : formatCarouselLabel(labels.slideOf, activeIndex + 1, count));

  return (
    <>
      <Box
        ref={rootRef}
        id={regionId}
        data-azes-carousel-root=""
        role="region"
        aria-roledescription="carousel"
        aria-label={regionLabel}
        sx={rootSx}
      >
        <Box
          id={liveId}
          role="status"
          aria-live="polite"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
          }}
        >
          {liveMessage}
        </Box>

        <Box
          ref={trackRef}
          data-azes-carousel-track=""
          tabIndex={0}
          onKeyDown={onKeyDown}
          sx={getCarouselTrackSx(theme)}
          aria-live="off"
        >
          {images.map((image, i) => {
            const alt =
              image.alt?.trim() ||
              (title
                ? `${title} — ${formatCarouselLabel(labels.slideOf, i + 1, count)}`
                : formatCarouselLabel(labels.slideOf, i + 1, count));
            const near = Math.abs(i - activeIndex) <= 1;
            const eager = priority ? i === 0 || near : near;
            return (
              <Box
                key={`${image.src}-${i}`}
                ref={(node: HTMLDivElement | null) => {
                  slideRefs.current[i] = node;
                }}
                data-slide-index={i}
                role="group"
                aria-roledescription="slide"
                aria-label={formatCarouselLabel(labels.slideOf, i + 1, count)}
                aria-hidden={i === activeIndex ? undefined : true}
                sx={getCarouselSlideSx(theme)}
              >
                {near || eager ? (
                  <SlideImage
                    src={image.src}
                    alt={alt}
                    srcSet={image.srcSet}
                    sizes={image.sizes}
                    eager={eager}
                    onClick={onImageClick ? () => onImageClick(i) : undefined}
                  />
                ) : null}
              </Box>
            );
          })}
        </Box>

        {multi ? <Box sx={getCarouselChromeOverlaySx(theme)} aria-hidden /> : null}

        {showArrows && multi ? (
          <>
            <IconButton
              type="button"
              aria-label={labels.previous}
              aria-disabled={prevDisabled || undefined}
              disabled={prevDisabled}
              onClick={() => goPrev()}
              sx={{
                ...getCarouselArrowSx(theme),
                insetInlineStart: theme.spacing(1.5),
              }}
            >
              {isRtl ? <IconArrowForward /> : <IconArrowBack />}
            </IconButton>
            <IconButton
              type="button"
              aria-label={labels.next}
              aria-disabled={nextDisabled || undefined}
              disabled={nextDisabled}
              onClick={() => goNext()}
              sx={{
                ...getCarouselArrowSx(theme),
                insetInlineEnd: theme.spacing(1.5),
              }}
            >
              {isRtl ? <IconArrowBack /> : <IconArrowForward />}
            </IconButton>
          </>
        ) : null}

        {showCounter && multi ? (
          <Box component="span" sx={getCarouselCounterSx(theme)}>
            {formatCarouselLabel(labels.slideOf, activeIndex + 1, count)}
          </Box>
        ) : null}

        {showFullscreen ? (
          <IconButton
            type="button"
            aria-label={labels.fullscreen}
            onClick={() => setLightboxOpen(true)}
            sx={getCarouselFullscreenBtnSx(theme)}
          >
            <IconFullscreen />
          </IconButton>
        ) : null}

        {showThumbnails && multi ? (
          <Box ref={thumbStripRef} sx={getCarouselThumbStripSx(theme)}>
            {images.map((image, i) => {
              const thumbSrc = image.thumbSrc ?? image.src;
              const active = i === activeIndex;
              return (
                <IconButton
                  key={`thumb-${i}`}
                  type="button"
                  data-thumb-index={i}
                  aria-label={formatCarouselLabel(labels.slideOf, i + 1, count)}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => goTo(i)}
                  sx={getCarouselThumbBtnSx(theme, active)}
                >
                  {failedThumbs[i] ? (
                    <IconImage fontSize="small" aria-hidden />
                  ) : (
                    <Box
                      component="img"
                      src={thumbSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e: SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                        setFailedThumbs((prev) => (prev[i] ? prev : { ...prev, [i]: true }));
                      }}
                    />
                  )}
                </IconButton>
              );
            })}
          </Box>
        ) : null}

        {multi ? (
          <Box sx={getCarouselDotsSx(theme)} aria-hidden>
            {visibleDots.map((i) => (
              <Box
                key={`dot-${i}`}
                component="button"
                type="button"
                tabIndex={-1}
                onClick={() => goTo(i)}
                sx={getCarouselDotSx(theme, i === activeIndex)}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      {showFullscreen ? (
        <Modal
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          aria-label={labels.fullscreen}
        >
          <Box
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                setLightboxOpen(false);
                return;
              }
              onKeyDown(event);
            }}
            sx={{
              ...getCarouselLightboxPaperSx(theme),
              p: 2,
              mt: '5vh',
              outline: 'none',
            }}
          >
            <IconButton
              type="button"
              aria-label={labels.closeFullscreen}
              onClick={() => setLightboxOpen(false)}
              autoFocus
              sx={{
                position: 'absolute',
                insetInlineEnd: theme.spacing(1),
                top: theme.spacing(-5),
                color: theme.vars.palette.common.white,
                zIndex: 3,
              }}
            >
              <IconClose />
            </IconButton>
            <Box
              data-azes-carousel-root=""
              role="region"
              aria-roledescription="carousel"
              aria-label={regionLabel}
              sx={getCarouselRootSx(theme, {
                variant: 'plain',
                aspectRatio: effectiveAspect,
                fit: 'contain',
                showArrows: multi,
              })}
            >
              <Box sx={{ ...getCarouselSlideSx(theme), aspectRatio: effectiveAspect }}>
                {currentImage ? (
                  <SlideImage
                    src={currentImage.src}
                    alt={currentAlt}
                    srcSet={currentImage.srcSet}
                    sizes={currentImage.sizes}
                    eager
                  />
                ) : null}
              </Box>
              {multi ? (
                <>
                  <IconButton
                    type="button"
                    aria-label={labels.previous}
                    disabled={prevDisabled}
                    onClick={() => goPrev()}
                    sx={{
                      ...getCarouselArrowSx(theme),
                      opacity: 1,
                      insetInlineStart: theme.spacing(1.5),
                      [theme.breakpoints.down('sm')]: { display: 'inline-flex' },
                    }}
                  >
                    {isRtl ? <IconArrowForward /> : <IconArrowBack />}
                  </IconButton>
                  <IconButton
                    type="button"
                    aria-label={labels.next}
                    disabled={nextDisabled}
                    onClick={() => goNext()}
                    sx={{
                      ...getCarouselArrowSx(theme),
                      opacity: 1,
                      insetInlineEnd: theme.spacing(1.5),
                      [theme.breakpoints.down('sm')]: { display: 'inline-flex' },
                    }}
                  >
                    {isRtl ? <IconArrowBack /> : <IconArrowForward />}
                  </IconButton>
                  <Box component="span" sx={getCarouselCounterSx(theme)}>
                    {formatCarouselLabel(labels.slideOf, activeIndex + 1, count)}
                  </Box>
                </>
              ) : null}
            </Box>
          </Box>
        </Modal>
      ) : null}
    </>
  );
}
