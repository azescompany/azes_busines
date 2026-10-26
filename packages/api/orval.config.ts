/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/orval.config.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-10-19
 * ║ Purpose: Orval generation config for @azes/api (multi-source)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { defineConfig } from 'orval';

const sharedOverride = {
  mutator: {
    path: './src/client/mutator.ts',
    name: 'azesMutator',
  },
  query: {
    useQuery: true,
    useMutation: true,
    signal: true,
  },
} as const;

export default defineConfig({
  /**
   * Scaffolding placeholder — kept isolated so `clean` cannot wipe ADMIN output.
   * Not a production contract.
   */
  placeholder: {
    input: {
      target: './openapi/openapi.placeholder.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/placeholder/endpoints.ts',
      schemas: './generated/placeholder/models',
      client: 'react-query',
      clean: true,
      prettier: true,
      override: sharedOverride,
    },
  },
  /**
   * ADMIN backend contract (CASPIAN.HOMES.Api). Isolated under generated/admin.
   */
  admin: {
    input: {
      target: './openapi/admin/swagger.json',
    },
    output: {
      mode: 'tags-split',
      target: './generated/admin/endpoints.ts',
      schemas: './generated/admin/models',
      client: 'react-query',
      clean: true,
      prettier: true,
      override: sharedOverride,
    },
  },
  /**
   * AZES api-server contract (auth slice Phase 2C). Isolated under generated/azes.
   */
  azes: {
    input: {
      target: './openapi/azes/openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/azes/endpoints.ts',
      schemas: './generated/azes/models',
      client: 'react-query',
      clean: true,
      prettier: true,
      override: sharedOverride,
    },
  },
});
