/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/scaffold-next-realestate.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: One-shot generator for Phase 10 Next.js realestate shell
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'apps/realestate';

function write(rel, contents) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf8');
}

write(
  `${base}/package.json`,
  `${JSON.stringify(
    {
      name: '@azes/realestate',
      version: '0.0.0',
      private: true,
      description: 'AZES Realestate Next.js App Router shell',
      type: 'module',
      scripts: {
        dev: 'next dev --port 3000',
        build: 'next build',
        start: 'next start --port 3000',
        typecheck: 'tsc -p tsconfig.json --noEmit',
        test: 'vitest run',
        lint: 'eslint .',
      },
      dependencies: {
        '@azes/api': 'workspace:*',
        '@azes/i18n': 'workspace:*',
        '@azes/state': 'workspace:*',
        '@azes/ui-web': 'workspace:*',
        '@tanstack/react-query': '^5.84.1',
        next: '^15.4.5',
        react: '^19.1.1',
        'react-dom': '^19.1.1',
      },
      devDependencies: {
        '@azes/typescript-config': 'workspace:*',
        '@azes/vitest-config': 'workspace:*',
        '@testing-library/jest-dom': '^6.6.4',
        '@testing-library/react': '^16.3.0',
        '@types/react': '^19.1.9',
        '@types/react-dom': '^19.1.7',
        '@vitejs/plugin-react': '^4.7.0',
        jsdom: '^26.1.0',
        typescript: '^5.9.2',
        vitest: '^3.2.4',
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
      extends: '@azes/typescript-config/nextjs.json',
      compilerOptions: {
        noEmit: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./src/*'] },
        types: ['vitest/globals'],
      },
      include: ['next-env.d.ts', 'app/**/*.ts', 'app/**/*.tsx', 'src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['node_modules', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
    null,
    2,
  )}\n`,
);

write(
  `${base}/next.config.ts`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/next.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Next.js config for @azes/realestate shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@azes/ui-web',
    '@azes/design-tokens',
    '@azes/api',
    '@azes/state',
    '@azes/i18n',
  ],
};

export default nextConfig;
`,
);

write(
  `${base}/next-env.d.ts`,
  `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
);

write(
  `${base}/vitest.config.ts`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/vitest.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest config for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createVitestConfig } from '@azes/vitest-config';
import react from '@vitejs/plugin-react';

export default createVitestConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
`,
);

write(
  `${base}/src/config/appMeta.ts`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/config/appMeta.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell identity metadata for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const appMeta = {
  name: 'Realestate',
  packageName: '@azes/realestate',
  platform: 'web-next' as const,
  env: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as
    | 'development'
    | 'production',
} as const;
`,
);

write(
  `${base}/src/providers/AppProviders.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/providers/AppProviders.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Client providers for Next.js realestate shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

import { apiQueryDefaultOptions } from '@azes/api';
import { createI18nInstance, I18nextProvider } from '@azes/i18n';
import { AzesStoreProvider, createAzesStore } from '@azes/state';
import { AzesThemeProvider } from '@azes/ui-web';
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
          <AzesThemeProvider>{children}</AzesThemeProvider>
        </I18nextProvider>
      </AzesStoreProvider>
    </QueryClientProvider>
  );
}
`,
);

write(
  `${base}/src/components/HomePage.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/components/HomePage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell Home for @azes/realestate (no business logic)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

import { useTranslation } from '@azes/i18n';
import { Box, Stack, Text } from '@azes/ui-web';

import { appMeta } from '../config/appMeta.js';

export function HomePage() {
  const { t } = useTranslation('common');

  return (
    <Box p={6} style={{ minHeight: '100vh' }}>
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
  `${base}/app/layout.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/app/layout.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Root layout with metadata for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from '../src/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'AZES Realestate',
  description: 'AZES Realestate application shell',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
`,
);

write(
  `${base}/app/page.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/app/page.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Home route for @azes/realestate shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { HomePage } from '../src/components/HomePage';

export default function Home() {
  return <HomePage />;
}
`,
);

write(
  `${base}/app/loading.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/app/loading.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Loading UI boundary for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export default function Loading() {
  return <p>Loading…</p>;
}
`,
);

write(
  `${base}/app/error.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/app/error.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Error UI boundary for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
`,
);

write(
  `${base}/app/globals.css`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/app/globals.css
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Global styles for @azes/realestate shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

html,
body {
  margin: 0;
  min-height: 100%;
}
`,
);

write(
  `${base}/src/test/setup.ts`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/test/setup.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest DOM setup for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '@testing-library/jest-dom/vitest';
`,
);

write(
  `${base}/src/config/appMeta.test.ts`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/config/appMeta.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: App metadata unit test for @azes/realestate
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it } from 'vitest';

import { appMeta } from './appMeta.js';

describe('appMeta', () => {
  it('identifies the Next.js shell', () => {
    expect(appMeta.packageName).toBe('@azes/realestate');
    expect(appMeta.platform).toBe('web-next');
  });
});
`,
);

write(
  `${base}/src/components/HomePage.test.tsx`,
  `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/realestate/src/components/HomePage.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Smoke test for realestate Home shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../providers/AppProviders.js';
import { HomePage } from './HomePage.js';
import { appMeta } from '../config/appMeta.js';

describe('@azes/realestate shell', () => {
  it('renders Home with app identity', async () => {
    render(
      <AppProviders>
        <HomePage />
      </AppProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText(new RegExp(\`AZES \${appMeta.name}\`, 'i'))).toBeTruthy();
    });
    expect(screen.getByText(new RegExp(appMeta.platform))).toBeTruthy();
  });
});
`,
);

write(
  `${base}/README.md`,
  `<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: apps/realestate/README.md
║ Author: AZES_COMPANY
║ Created: 2026-08-22
║ Updated: 2026-08-22
║ Purpose: Runbook for @azes/realestate shell
║ Layer: app
╚══════════════════════════════════════════════════════════════╝
-->

# @azes/realestate

Next.js App Router shell (Home only). Dev port: **3000**.

\`\`\`bash
pnpm --filter @azes/realestate dev
\`\`\`
`,
);

write(
  `${base}/.env.example`,
  `# AZES COMPANY
# File: apps/realestate/.env.example
# Author: AZES_COMPANY
# Created: 2026-08-22
# Updated: 2026-08-22
# Purpose: Example public env for @azes/realestate
# Layer: app

NEXT_PUBLIC_APP_ENV=development
`,
);

console.warn('Scaffolded Next.js realestate shell');
