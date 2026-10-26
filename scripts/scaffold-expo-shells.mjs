/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/scaffold-expo-shells.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: One-shot generator for Phase 10 Expo mobile shells
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const apps = [
  { name: 'mobile-account', title: 'Mobile Account', slug: 'mobile-account' },
  { name: 'mobile-agent', title: 'Mobile Agent', slug: 'mobile-agent' },
  { name: 'mobile-realestate', title: 'Mobile Realestate', slug: 'mobile-realestate' },
];

function write(rel, contents) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
}

for (const app of apps) {
  const pkgName = `@azes/${app.name}`;
  const base = `apps/${app.name}`;

  write(
    `${base}/package.json`,
    `${JSON.stringify(
      {
        name: pkgName,
        version: '0.0.0',
        private: true,
        description: `AZES ${app.title} Expo shell`,
        main: 'expo-router/entry',
        scripts: {
          dev: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web',
          build: 'tsc -p tsconfig.json --noEmit',
          typecheck: 'tsc -p tsconfig.json --noEmit',
          test: 'vitest run',
          lint: 'eslint .',
        },
        dependencies: {
          '@azes/api': 'workspace:*',
          '@azes/i18n': 'workspace:*',
          '@azes/state': 'workspace:*',
          '@azes/ui-native': 'workspace:*',
          '@tanstack/react-query': '^5.84.1',
          expo: '~53.0.20',
          'expo-router': '~5.1.4',
          'expo-status-bar': '~2.2.3',
          react: '19.0.0',
          'react-native': '0.79.5',
          'react-native-safe-area-context': '5.4.0',
          'react-native-screens': '~4.11.1',
        },
        devDependencies: {
          '@azes/typescript-config': 'workspace:*',
          '@azes/vitest-config': 'workspace:*',
          '@types/react': '^19.1.9',
          typescript: '^5.9.2',
          vitest: '^3.2.4',
        },
      },
      null,
      2,
    )}\n`,
  );

  write(
    `${base}/app.json`,
    `${JSON.stringify(
      {
        expo: {
          name: `AZES ${app.title}`,
          slug: app.slug,
          version: '0.0.0',
          orientation: 'portrait',
          scheme: `azes-${app.slug}`,
          userInterfaceStyle: 'automatic',
          newArchEnabled: true,
          plugins: ['expo-router'],
          experiments: { typedRoutes: true },
        },
      },
      null,
      2,
    )}\n`,
  );

  write(
    `${base}/tsconfig.json`,
    `${JSON.stringify(
      {
        $schema: 'https://json.schemastore.org/tsconfig',
        extends: '@azes/typescript-config/native.json',
        compilerOptions: {
          strict: true,
          paths: { '@/*': ['./src/*'] },
          types: ['vitest/globals'],
        },
        include: ['app/**/*.ts', 'app/**/*.tsx', 'src/**/*.ts', 'src/**/*.tsx', 'expo-env.d.ts'],
        exclude: ['node_modules', 'src/**/*.test.ts'],
      },
      null,
      2,
    )}\n`,
  );

  write(
    `${base}/babel.config.js`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/babel.config.js
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Babel config for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
`,
  );

  write(
    `${base}/vitest.config.ts`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createVitestConfig } from '@azes/vitest-config';

export default createVitestConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
`,
  );

  write(
    `${base}/src/config/appMeta.ts`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/config/appMeta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell identity metadata for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const appMeta = {
  name: '${app.title}',
  packageName: '${pkgName}',
  platform: 'mobile-expo' as const,
  env: (
    typeof __DEV__ !== 'undefined' ? (__DEV__ ? 'development' : 'production') : 'development'
  ) as 'development' | 'production',
} as const;
`,
  );

  write(
    `${base}/src/providers/AppProviders.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/providers/AppProviders.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Theme, Query, Store, i18n providers for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { apiQueryDefaultOptions } from '@azes/api';
import { createI18nInstance, I18nextProvider } from '@azes/i18n';
import { AzesStoreProvider, createAzesStore } from '@azes/state';
import { ThemeProvider } from '@azes/ui-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

type I18nInstance = Awaited<ReturnType<typeof createI18nInstance>>;

export type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const store = useMemo(() => createAzesStore(), []);
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: apiQueryDefaultOptions }),
    [],
  );
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createI18nInstance().then((instance) => {
      if (!cancelled) {
        setI18n(instance);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!i18n) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AzesStoreProvider store={store}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme="light">{children}</ThemeProvider>
        </I18nextProvider>
      </AzesStoreProvider>
    </QueryClientProvider>
  );
}
`,
  );

  write(
    `${base}/src/components/HomeScreen.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/components/HomeScreen.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell Home screen for ${pkgName} (no business logic)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import { Box, Stack, Text } from '@azes/ui-native';

import { appMeta } from '../config/appMeta';

export function HomeScreen() {
  const { t } = useTranslation('common');

  return (
    <Box p={6} style={{ flex: 1 }}>
      <Stack gap={4}>
        <Text size="2xl" weight="bold">
          AZES {appMeta.name}
        </Text>
        <Text tone="muted">
          Platform: {appMeta.platform} · Environment: {appMeta.env}
        </Text>
        <Text size="sm" tone="muted">
          {t('save')} · Application shell — ready for future features.
        </Text>
      </Stack>
    </Box>
  );
}
`,
  );

  write(
    `${base}/app/_layout.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/app/_layout.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Expo Router root layout for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '../src/providers/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
`,
  );

  write(
    `${base}/app/index.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/app/index.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Home route for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { HomeScreen } from '../src/components/HomeScreen';

export default function HomeRoute() {
  return <HomeScreen />;
}
`,
  );

  write(
    `${base}/src/config/appMeta.test.ts`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/config/appMeta.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: App metadata unit test for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { appMeta } from './appMeta';

describe('appMeta', () => {
  it('identifies the Expo shell', () => {
    expect(appMeta.packageName).toBe('${pkgName}');
    expect(appMeta.platform).toBe('mobile-expo');
    expect(appMeta.name.length).toBeGreaterThan(0);
  });
});
`,
  );

  write(
    `${base}/README.md`,
    `<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: ${base}/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Runbook for ${pkgName} shell
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# ${pkgName}

Expo (expo-router) shell — Home screen only.

\`\`\`bash
pnpm --filter ${pkgName} dev
\`\`\`
`,
  );

  write(
    `${base}/expo-env.d.ts`,
    `/// <reference types="expo/types" />
`,
  );
}

console.warn('Scaffolded Expo shells:', apps.map((a) => a.name).join(', '));
