/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/vite.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-09-29
 * ║ Updated: 2026-10-26
 * ║ Purpose: Vite config for the design-system showcase (+ AI proxy)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

import { azesAiProxyPlugin } from './server/aiProxy.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');

  return {
    plugins: [
      react(),
      azesAiProxyPlugin({
        rootDir,
        getEnv: () => ({
          apiKey: env.NVIDIA_API_KEY?.trim() ?? '',
          apiUrl:
            env.NVIDIA_API_URL?.trim() || 'https://integrate.api.nvidia.com/v1/chat/completions',
          model: env.NVIDIA_MODEL?.trim() || 'nvidia/nemotron-3.5-super-vl-120b-a12b',
          // Corporate SSL inspection often needs this for local NVIDIA calls.
          tlsInsecure: /^(1|true|yes)$/i.test(env.NVIDIA_TLS_INSECURE?.trim() ?? ''),
        }),
      }),
    ],
    resolve: {
      alias: {
        '@azes/assets': path.resolve(rootDir, '../../packages/assets'),
      },
    },
    server: { port: 700, strictPort: true },
    preview: { port: 700, strictPort: true },
  };
});
