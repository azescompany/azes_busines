/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/i18n/src/config/resources.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-04
 * ║ Purpose: Bundled shared namespaces (apps add their own namespaces)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import commonAz from '../locales/az/common.json' with { type: 'json' };
import commonEn from '../locales/en/common.json' with { type: 'json' };
import commonRu from '../locales/ru/common.json' with { type: 'json' };

import { DEFAULT_NAMESPACE } from './constants';

export type LocaleResources = Record<string, Record<string, unknown>>;

/** Minimal shared resources shipped by the package — not app product copy. */
export const bundledResources: LocaleResources = {
  en: {
    [DEFAULT_NAMESPACE]: commonEn,
  },
  az: {
    [DEFAULT_NAMESPACE]: commonAz,
  },
  ru: {
    [DEFAULT_NAMESPACE]: commonRu,
  },
};
