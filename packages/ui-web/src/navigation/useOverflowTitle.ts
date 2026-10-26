/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/navigation/useOverflowTitle.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Show tooltip title only when label text is ellipsized
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useLayoutEffect, useState, type RefCallback } from 'react';

/**
 * Tracks whether an element’s content overflows (ellipsis).
 * Returns a tooltip title of `fullTitle` only when truncated; otherwise `''`
 * so MUI Tooltip stays disabled.
 */
export function useOverflowTitle(fullTitle: string): {
  title: string;
  ref: RefCallback<HTMLElement | null>;
} {
  const [overflowing, setOverflowing] = useState(false);
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback<RefCallback<HTMLElement | null>>((el) => {
    setNode(el);
  }, []);

  useLayoutEffect(() => {
    if (!node) {
      setOverflowing(false);
      return;
    }

    const measure = () => {
      setOverflowing(node.scrollWidth > node.clientWidth + 1);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [node, fullTitle]);

  return { title: overflowing ? fullTitle : '', ref };
}
