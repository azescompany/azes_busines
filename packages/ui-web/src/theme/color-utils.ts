/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/theme/color-utils.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: OKLCH/OKLab color math, WCAG contrast and gamut mapping (no deps)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type Oklch = { l: number; c: number; h: number };
export type Oklab = { L: number; a: number; b: number };

const HEX6 = /^#[0-9a-fA-F]{6}$/;
const HEX3 = /^#[0-9a-fA-F]{3}$/;

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  if (HEX6.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (HEX3.test(trimmed)) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function isHexColor(value: string): boolean {
  return HEX6.test(value) || HEX3.test(value);
}

function srgbChannelToLinear(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.04045 ? c / 12.92 : Math.sign(c) * ((abs + 0.055) / 1.055) ** 2.4;
}

function linearToSrgbChannel(c: number): number {
  const abs = Math.abs(c);
  return abs <= 0.0031308 ? 12.92 * c : Math.sign(c) * (1.055 * abs ** (1 / 2.4) - 0.055);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function rgbToOklab(r: number, g: number, b: number): Oklab {
  const lr = srgbChannelToLinear(r);
  const lg = srgbChannelToLinear(g);
  const lb = srgbChannelToLinear(b);

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinearRgb(lab: Oklab): [number, number, number] {
  const l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

export function oklabToOklch(lab: Oklab): Oklch {
  const c = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: lab.L, c, h: c < 1e-8 ? 0 : h };
}

export function oklchToOklab(oklch: Oklch): Oklab {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    L: oklch.l,
    a: oklch.c * Math.cos(hRad),
    b: oklch.c * Math.sin(hRad),
  };
}

/** Relative luminance (WCAG 2.x) for sRGB hex. */
export function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  const r = srgbChannelToLinear(Number.parseInt(normalized.slice(1, 3), 16) / 255);
  const g = srgbChannelToLinear(Number.parseInt(normalized.slice(3, 5), 16) / 255);
  const b = srgbChannelToLinear(Number.parseInt(normalized.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two sRGB hex colors. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** ΔE in OKLab (Euclidean). Typical just-noticeable ≈ 0.02; brand pairs target ≥ 0.15. */
export function deltaE(a: string, b: string): number {
  const A = hexToOklab(a);
  const B = hexToOklab(b);
  return Math.sqrt((A.L - B.L) ** 2 + (A.a - B.a) ** 2 + (A.b - B.b) ** 2);
}

export function hexToOklab(hex: string): Oklab {
  const normalized = normalizeHex(hex);
  const r = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const g = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const b = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  return rgbToOklab(r, g, b);
}

export function hexToOklch(hex: string): Oklch {
  return oklabToOklch(hexToOklab(hex));
}

function isInGamut(lr: number, lg: number, lb: number): boolean {
  return (
    lr >= -1e-6 && lr <= 1 + 1e-6 && lg >= -1e-6 && lg <= 1 + 1e-6 && lb >= -1e-6 && lb <= 1 + 1e-6
  );
}

/**
 * Convert OKLCH to `#rrggbb`, reducing chroma until the color is in sRGB gamut.
 */
export function oklchToHex(oklch: Oklch): string {
  const l = clamp01(oklch.l);
  let lo = 0;
  let hi = Math.max(0, oklch.c);
  let best: [number, number, number] | null = null;

  for (let i = 0; i < 24; i += 1) {
    const c = (lo + hi) / 2;
    const [lr, lg, lb] = oklabToLinearRgb(oklchToOklab({ l, c, h: oklch.h }));
    if (isInGamut(lr, lg, lb)) {
      best = [lr, lg, lb];
      lo = c;
    } else {
      hi = c;
    }
  }

  if (!best) {
    const [lr, lg, lb] = oklabToLinearRgb(oklchToOklab({ l, c: 0, h: 0 }));
    best = [lr, lg, lb];
  }

  const toByte = (channel: number) =>
    Math.round(clamp01(linearToSrgbChannel(channel)) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toByte(best[0])}${toByte(best[1])}${toByte(best[2])}`;
}

/** Shortest absolute hue difference in degrees (0–180). */
export function hueDelta(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/** Prefer white or black text on `background` for maximum contrast. */
export function bestContrastText(background: string): string {
  const white = contrastRatio('#ffffff', background);
  const black = contrastRatio('#000000', background);
  return white >= black ? '#ffffff' : '#000000';
}

/**
 * Mix `overlay` into `base` by `amount` (0–1) in linear sRGB, return `#rrggbb`.
 * Used for palette.action channels (MUI requires parseable hex/rgb, not `color-mix`).
 */
export function mixHex(base: string, overlay: string, amount: number): string {
  const t = clamp01(amount);
  const b = normalizeHex(base);
  const o = normalizeHex(overlay);
  const mixChannel = (from: number, to: number) => {
    const lf = srgbChannelToLinear(from / 255);
    const lt = srgbChannelToLinear(to / 255);
    return Math.round(clamp01(linearToSrgbChannel(lf * (1 - t) + lt * t)) * 255);
  };
  const br = Number.parseInt(b.slice(1, 3), 16);
  const bg = Number.parseInt(b.slice(3, 5), 16);
  const bb = Number.parseInt(b.slice(5, 7), 16);
  const or_ = Number.parseInt(o.slice(1, 3), 16);
  const og = Number.parseInt(o.slice(3, 5), 16);
  const ob = Number.parseInt(o.slice(5, 7), 16);
  const toByte = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toByte(mixChannel(br, or_))}${toByte(mixChannel(bg, og))}${toByte(mixChannel(bb, ob))}`;
}

/** Legacy HSL helpers kept for any external callers; prefer OKLCH. */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHex(hex);
  const r = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const g = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const b = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp01(s);
  const light = clamp01(l);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c;
    g = x;
  } else if (hue < 120) {
    r = x;
    g = c;
  } else if (hue < 180) {
    g = c;
    b = x;
  } else if (hue < 240) {
    g = x;
    b = c;
  } else if (hue < 300) {
    r = x;
    b = c;
  } else {
    r = x;
    b = c;
  }
  const toByte = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}
