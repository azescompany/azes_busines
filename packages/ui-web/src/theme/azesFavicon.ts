/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/azesFavicon.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-15
 * ║ Purpose: Home favicon tinted from brand primary (FOUC + runtime)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Artwork: filled home glyph (Material Home path, 24×24) — readable at 16px tabs.
 * Color: settings / azes-ui cookie primary → data-URL SVG on <link rel="icon">
 * (including static `/favicon.ico` fallbacks tagged `data-azes-favicon` — .ico itself
 * cannot recolor; runtime always paints SVG).
 */

import { DEFAULT_PRIMARY, resolveBrandPrimary, readStoredPrimary } from './brand';
import { AZES_PRIMARY_PREF_BASE, AZES_UI_SYNC_COOKIE, azesPrefsKey } from './crossPortStorage';

/** Square Material icon canvas. */
export const AZES_FAVICON_VIEWBOX = '0 0 24 24';

export const AZES_FAVICON_LINK_ATTR = 'data-azes-favicon';

/**
 * Filled home silhouette — same geometry as `@mui/icons-material/Home`
 * (matches product “ev” metaphor; outlined strokes vanish at favicon size).
 */
export const AZES_FAVICON_HOME_PATHS = ['M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'] as const;

/** @deprecated Use `AZES_FAVICON_HOME_PATHS`. */
export const AZES_FAVICON_KEY_PATHS = AZES_FAVICON_HOME_PATHS;

const HEX = /^#[0-9a-fA-F]{6}$/;

let lastAppliedHex: string | null = null;

function normalizeFaviconHex(value: string | null | undefined): string {
  const resolved = resolveBrandPrimary(value ?? DEFAULT_PRIMARY);
  return HEX.test(resolved) ? resolved.toLowerCase() : DEFAULT_PRIMARY.toLowerCase();
}

/** Standalone SVG document for `/favicon.svg` or data-URL icons. */
export function buildAzesFaviconSvg(primary: string = DEFAULT_PRIMARY): string {
  const fill = normalizeFaviconHex(primary);
  return buildAzesFaviconSvgRaw(fill);
}

/** @deprecated Use `buildAzesFaviconSvg`. */
export const buildAzesKeyFaviconSvg = buildAzesFaviconSvg;

/** Raw SVG with an arbitrary fill token (hex or prepaint placeholder). */
export function buildAzesFaviconSvgRaw(fill: string): string {
  const paths = AZES_FAVICON_HOME_PATHS.map((d) => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${AZES_FAVICON_VIEWBOX}" fill="${fill}">${paths}</svg>`;
}

/** @deprecated Use `buildAzesFaviconSvgRaw`. */
export const buildAzesKeyFaviconSvgRaw = buildAzesFaviconSvgRaw;

export function buildAzesFaviconDataUrl(primary: string = DEFAULT_PRIMARY): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildAzesFaviconSvg(primary))}`;
}

/** @deprecated Use `buildAzesFaviconDataUrl`. */
export const buildAzesKeyFaviconDataUrl = buildAzesFaviconDataUrl;

function ensureFaviconLinks(doc: Document): HTMLLinkElement[] {
  const existing = Array.from(
    doc.querySelectorAll<HTMLLinkElement>(`link[${AZES_FAVICON_LINK_ATTR}]`),
  );
  if (existing.length > 0) return existing;

  const icon = doc.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? doc.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.setAttribute(AZES_FAVICON_LINK_ATTR, '');
  if (!icon.parentNode) {
    doc.head.appendChild(icon);
  }

  const apple =
    doc.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]') ?? doc.createElement('link');
  apple.rel = 'apple-touch-icon';
  apple.setAttribute(AZES_FAVICON_LINK_ATTR, '');
  if (!apple.parentNode) {
    doc.head.appendChild(apple);
  }

  return [icon, apple];
}

/** Paint tab / apple-touch icons with the home glyph in `primary` hex. */
export function applyAzesFavicon(primary: string = DEFAULT_PRIMARY): string {
  if (typeof document === 'undefined') {
    return normalizeFaviconHex(primary);
  }

  const hex = normalizeFaviconHex(primary);
  if (hex === lastAppliedHex) return hex;

  const href = buildAzesFaviconDataUrl(hex);
  for (const link of ensureFaviconLinks(document)) {
    // Prefer SVG data-URL even when the markup pointed at `/favicon.ico`.
    if (link.rel === 'icon' || link.rel === 'shortcut icon') {
      link.type = 'image/svg+xml';
      link.removeAttribute('sizes');
    }
    link.href = href;
  }
  lastAppliedHex = hex;
  return hex;
}

/** Resolve cookie/storage primary and apply (FOUC parity from React boot). */
export function syncAzesFaviconFromPrefs(): string {
  return applyAzesFavicon(readStoredPrimary() ?? DEFAULT_PRIMARY);
}

/**
 * Inline IIFE for Vite `transformIndexHtml` — paints favicon from `azes-ui` /
 * `azes-primary` before React loads (same cookie bridge as color-scheme FOUC).
 * Pass `scopeId` (e.g. `caspian`) for marketplace-isolated cookie names.
 */
export function getAzesFaviconPrepaintScript(scopeId?: string | null): string {
  const svgTemplate = buildAzesFaviconSvgRaw('__AZES_PRIMARY__');
  const escapedSvg = JSON.stringify(svgTemplate);
  const uiCookie = azesPrefsKey(AZES_UI_SYNC_COOKIE, scopeId);
  const primaryCookie = azesPrefsKey(AZES_PRIMARY_PREF_BASE, scopeId);
  return `(function(){try{function cookie(n){var p=n+'=',a=document.cookie.split(';');for(var i=0;i<a.length;i++){var t=a[i].trim();if(t.indexOf(p)===0){try{return decodeURIComponent(t.slice(p.length))}catch(e){return t.slice(p.length)}}}return null}var ui=cookie(${JSON.stringify(uiCookie)}),primary=null;if(ui){var parts=ui.split('|');if(parts.length>=2&&parts[1]&&parts[1]!=='-')primary=parts[1]}primary=primary||cookie(${JSON.stringify(primaryCookie)})||localStorage.getItem(${JSON.stringify(primaryCookie)});if(!primary||!/^#[0-9a-fA-F]{6}$/i.test(primary))return;var svg=${escapedSvg}.split('__AZES_PRIMARY__').join(primary.toLowerCase());var href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);var links=document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');for(var i=0;i<links.length;i++)links[i].setAttribute('href',href)}catch(e){}})();`;
}

/**
 * Vite `transformIndexHtml` plugin (no `vite` import — plain object).
 * Injects cookie-aware favicon tint before React hydrates.
 */
export function createAzesFaviconHtmlPlugin(): {
  name: string;
  transformIndexHtml: (html: string) => string;
} {
  return {
    name: 'azes-favicon-prepaint',
    transformIndexHtml(html: string) {
      if (html.includes('data-azes-favicon-boot')) return html;
      return html.replace(
        '</head>',
        `    <script data-azes-favicon-boot>${getAzesFaviconPrepaintScript()}</script>\n  </head>`,
      );
    },
  };
}

/** Test helper — clears apply cache between cases. */
export function resetAzesFaviconCacheForTests(): void {
  lastAppliedHex = null;
}
