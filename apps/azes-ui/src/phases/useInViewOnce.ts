/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/phases/useInViewOnce.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Reveal observer + scroll-spy with click lock for sticky nav
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export function useInViewOnce<T extends Element>(
  disabled = false,
  rootMargin = '0px 0px -8% 0px',
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled, rootMargin]);

  return [ref, visible];
}

export type ActiveSectionApi = {
  activeId: string | null;
  /** Call on chip click — locks active id while smooth-scroll settles. */
  activate: (id: string) => void;
};

/**
 * Sticky-nav scroll spy: last section whose top has crossed the sticky offset
 * wins (document order). Click lock prevents IO/ratio races that leave the
 * second chip active after returning to the first.
 */
export function useActiveSectionId(
  sectionIds: readonly string[],
  enabled: boolean,
  /** Distance from viewport top where “current section” is decided (sticky chrome). */
  offsetPx = 128,
): ActiveSectionApi {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const lockRef = useRef<{ id: string; until: number } | null>(null);
  const idsKey = sectionIds.join('|');

  const compute = useCallback(() => {
    if (!enabled || sectionIds.length === 0) return;
    const lock = lockRef.current;
    if (lock && Date.now() < lock.until) {
      setActiveId(lock.id);
      return;
    }
    if (lock && Date.now() >= lock.until) lockRef.current = null;

    let current = sectionIds[0] ?? null;
    for (const id of sectionIds) {
      const el = document.getElementById(`demo-${id}`);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top - offsetPx <= 2) current = id;
    }
    setActiveId(current);
  }, [enabled, offsetPx, sectionIds, idsKey]);

  useEffect(() => {
    if (!enabled) return;
    compute();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    // Scoop / nested scrollports: listen on capture + window.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [compute, enabled]);

  const activate = useCallback((id: string) => {
    lockRef.current = { id, until: Date.now() + 1000 };
    setActiveId(id);
  }, []);

  return { activeId, activate };
}
