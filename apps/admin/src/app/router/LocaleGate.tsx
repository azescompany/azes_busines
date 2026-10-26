/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/LocaleGate.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Sync i18n language from URL `/:locale` segment
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  changeAppLocale,
  DEFAULT_LOCALE,
  isSupportedLocale,
  useTranslation,
  type SupportedLocale,
} from '@azes/i18n';
import { useEffect, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router';

import { pathTo, PATHS } from './paths.js';

export type LocaleGateProps = {
  children: ReactNode;
};

export function LocaleGate({ children }: LocaleGateProps) {
  const { locale } = useParams();
  const { i18n } = useTranslation();
  const valid = Boolean(locale && isSupportedLocale(locale));

  useEffect(() => {
    if (!locale || !isSupportedLocale(locale)) return;
    const next = locale as SupportedLocale;
    if (i18n.language?.slice(0, 2) !== next) {
      void changeAppLocale(i18n, next);
    }
  }, [locale, i18n]);

  if (!valid) {
    return <Navigate to={pathTo(PATHS.home, DEFAULT_LOCALE)} replace />;
  }

  return <>{children}</>;
}
