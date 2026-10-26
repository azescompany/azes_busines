/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: scripts/scaffold-vite-shells.mjs
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: One-shot generator for Phase 10 Vite SPA shells
 * ║ Layer: tooling
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const apps = [
  { name: 'account', title: 'Account', port: 5173 },
  { name: 'admin', title: 'Admin', port: 5174 },
  { name: 'agent-platform', title: 'Agent Platform', port: 5175 },
  { name: 'agent-site', title: 'Agent Site', port: 5176 },
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
        description: `AZES ${app.title} web SPA shell (Vite)`,
        type: 'module',
        scripts: {
          dev: `vite --port ${app.port} --strictPort`,
          build: 'tsc -p tsconfig.json --noEmit && vite build',
          preview: `vite preview --port ${app.port}`,
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
          vite: '^7.0.6',
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
        extends: '@azes/typescript-config/react.json',
        compilerOptions: {
          noEmit: true,
          jsx: 'react-jsx',
          types: ['vite/client', 'vitest/globals'],
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'node_modules'],
      },
      null,
      2,
    )}\n`,
  );

  write(
    `${base}/vite.config.ts`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/vite.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vite config for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { port: ${app.port}, strictPort: true },
  preview: { port: ${app.port}, strictPort: true },
});
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
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
`,
  );

  write(
    `${base}/index.html`,
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AZES ${app.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
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
  platform: 'web-vite' as const,
  env: (import.meta.env.MODE === 'production' ? 'production' : 'development') as
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
 * ║ File: ${base}/src/providers/AppProviders.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Theme, Query, Store, and i18n providers for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

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
 * ║ File: ${base}/src/components/HomePage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Shell Home page for ${pkgName} (no business logic)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Box, Stack, Text } from '@azes/ui-web';
import { useTranslation } from '@azes/i18n';

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
    `${base}/src/app/App.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/app/App.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Root application component for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { HomePage } from '../components/HomePage.js';
import { AppProviders } from '../providers/AppProviders.js';

export function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  );
}
`,
  );

  write(
    `${base}/src/main.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/main.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vite entry for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.js';
import './styles.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
  );

  write(
    `${base}/src/styles.css`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/styles.css
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Global shell styles for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

html,
body,
#root {
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
 * ║ File: ${base}/src/test/setup.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Vitest DOM setup for ${pkgName}
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '@testing-library/jest-dom/vitest';
`,
  );

  write(
    `${base}/src/components/HomePage.test.tsx`,
    `/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: ${base}/src/components/HomePage.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Smoke test for ${pkgName} Home shell
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../app/App.js';
import { appMeta } from '../config/appMeta.js';

describe('${pkgName} shell', () => {
  it('renders Home with app identity', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(new RegExp(\`AZES \${appMeta.name}\`, 'i'))).toBeTruthy();
    });
    expect(screen.getByText(new RegExp(appMeta.platform))).toBeTruthy();
    expect(screen.getByText(/Environment:/i)).toBeTruthy();
  });
});
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

import { appMeta } from './appMeta.js';

describe('appMeta', () => {
  it('identifies the shell', () => {
    expect(appMeta.packageName).toBe('${pkgName}');
    expect(appMeta.platform).toBe('web-vite');
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

AZES **${app.title}** Vite SPA shell (Home only). Dev port: **${app.port}**.

\`\`\`bash
pnpm --filter ${pkgName} dev
\`\`\`
`,
  );

  write(
    `${base}/.env.example`,
    `# AZES COMPANY
# File: ${base}/.env.example
# Author: AZES_COMPANY
# Created: 2026-08-22
# Updated: 2026-08-22
# Purpose: Example public env for ${pkgName}
# Layer: app

VITE_APP_ENV=development
`,
  );
}

console.warn('Scaffolded Vite shells:', apps.map((a) => a.name).join(', '));
