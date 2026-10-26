/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/app/App.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-19
 * ║ Purpose: Showcase root — i18n (default az) + AzesUiProvider + shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { I18nextProvider, type I18nInstance } from '@azes/i18n';
import { AzesUiProvider } from '@azes/ui-web/settings';
import { useEffect, useState } from 'react';

import { createShowcaseI18n } from '../i18n/createShowcaseI18n.js';
import { ShowcaseApp } from './ShowcaseApp.js';

export function App() {
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createShowcaseI18n().then((instance) => {
      if (!cancelled) setI18n(instance);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!i18n) return null;

  return (
    <I18nextProvider i18n={i18n}>
      {/* Keep navLayout control so designers can preview vertical / mini / horizontal. */}
      <AzesUiProvider hiddenControls={['direction']}>
        <ShowcaseApp />
      </AzesUiProvider>
    </I18nextProvider>
  );
}
