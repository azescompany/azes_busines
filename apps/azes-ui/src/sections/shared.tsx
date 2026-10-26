/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/shared.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-02
 * ║ Purpose: Shared layout helpers for showcase section pages
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiBox, Typography } from '@azes/ui-web';
import type { ReactNode } from 'react';

export function StackText({ children }: { children: ReactNode }) {
  return <MuiBox sx={{ display: 'grid', gap: 2 }}>{children}</MuiBox>;
}

export function SectionIntro({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <StackText>
      {title ? (
        <Typography variant="body1" color="text.secondary">
          {title}
        </Typography>
      ) : null}
      {children}
    </StackText>
  );
}
