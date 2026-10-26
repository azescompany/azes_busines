/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/routing/useHashRoute.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Hash router for catalog phases + AzesNav router adapter
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { AzesRouterAdapter } from '@azes/ui-web/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_PHASE_ID, parsePhaseHash, type PhaseId } from '../phases/phaseRegistry.js';

export const toHashHref = (path: string): string => `#${path}`;

function readPhase(): PhaseId {
  return parsePhaseHash(window.location.hash) ?? DEFAULT_PHASE_ID;
}

export type HashRoute = {
  phaseId: PhaseId;
  navigate: (id: string) => void;
  router: AzesRouterAdapter;
};

export function useHashRoute(): HashRoute {
  const [phaseId, setPhaseId] = useState(readPhase);

  useEffect(() => {
    const onHashChange = () => setPhaseId(readPhase());
    window.addEventListener('hashchange', onHashChange);
    if (!window.location.hash) window.location.hash = `#/${DEFAULT_PHASE_ID}`;
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((id: string) => {
    window.location.hash = `#/${id}`;
    const next = parsePhaseHash(`#/${id}`) ?? DEFAULT_PHASE_ID;
    setPhaseId(next);
  }, []);

  const router = useMemo<AzesRouterAdapter>(
    () => ({ pathname: `/${phaseId}`, toHref: toHashHref }),
    [phaseId],
  );

  return { phaseId, navigate, router };
}
