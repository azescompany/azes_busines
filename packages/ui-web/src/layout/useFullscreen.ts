/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/layout/useFullscreen.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Document fullscreen API state + toggle for chrome controls
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useState } from 'react';

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenEnabled?: boolean;
};

type FullscreenElement = Element & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function readFullscreenElement(doc: Document): Element | null {
  const d = doc as FullscreenDocument;
  return doc.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

function isFullscreenSupported(doc: Document): boolean {
  const d = doc as FullscreenDocument;
  return Boolean(doc.fullscreenEnabled || d.webkitFullscreenEnabled);
}

async function requestFullscreen(el: Element): Promise<void> {
  const target = el as FullscreenElement;
  if (typeof el.requestFullscreen === 'function') {
    await el.requestFullscreen();
    return;
  }
  if (typeof target.webkitRequestFullscreen === 'function') {
    await target.webkitRequestFullscreen();
  }
}

async function exitFullscreen(doc: Document): Promise<void> {
  const d = doc as FullscreenDocument;
  if (typeof doc.exitFullscreen === 'function' && doc.fullscreenElement) {
    await doc.exitFullscreen();
    return;
  }
  if (typeof d.webkitExitFullscreen === 'function' && d.webkitFullscreenElement) {
    await d.webkitExitFullscreen();
  }
}

export type UseFullscreenOptions = {
  /** Element to enter fullscreen; defaults to `document.documentElement`. */
  target?: Element | null;
};

export type UseFullscreenResult = {
  active: boolean;
  supported: boolean;
  toggle: () => Promise<void>;
};

/** Tracks fullscreen state and toggles the document / target element. */
export function useFullscreen(options: UseFullscreenOptions = {}): UseFullscreenResult {
  const { target = null } = options;
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    setSupported(isFullscreenSupported(document));
    const sync = () => setActive(Boolean(readFullscreenElement(document)));
    sync();
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggle = useCallback(async () => {
    if (typeof document === 'undefined') return;
    const el = target ?? document.documentElement;
    try {
      if (readFullscreenElement(document)) {
        await exitFullscreen(document);
      } else {
        await requestFullscreen(el);
      }
    } catch {
      // Policy / missing user gesture — leave UI state to the next fullscreenchange.
    }
  }, [target]);

  return { active, supported, toggle };
}
