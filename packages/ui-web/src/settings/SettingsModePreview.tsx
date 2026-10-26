/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/SettingsModePreview.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-06
 * ║ Purpose: Mini window previews for light / dark / system mode cards
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import { semanticColorDark, semanticColorLight } from '@azes/design-tokens';

export type SettingsModePreviewKind = 'light' | 'dark' | 'system';

function WindowChrome({
  canvas,
  surface,
  muted,
  border,
  accent,
}: {
  canvas: string;
  surface: string;
  muted: string;
  border: string;
  accent: string;
}) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 64,
        height: 44,
        borderRadius: '7px',
        overflow: 'hidden',
        border: `1px solid ${border}`,
        backgroundColor: canvas,
        display: 'grid',
        gridTemplateRows: '10px 1fr',
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${surface} 40%, transparent)`,
      }}
    >
      <Box sx={{ backgroundColor: surface, borderBottom: `1px solid ${border}` }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '14px 1fr', minHeight: 0 }}>
        <Box sx={{ backgroundColor: muted, borderInlineEnd: `1px solid ${border}` }} />
        <Box sx={{ p: '5px', display: 'grid', gap: '4px', alignContent: 'start' }}>
          <Box
            sx={{
              height: 7,
              borderRadius: '3px',
              backgroundColor: accent,
              opacity: 0.85,
            }}
          />
          <Box
            sx={{
              height: 7,
              borderRadius: '3px',
              backgroundColor: muted,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

export function SettingsModePreview({ kind }: { kind: SettingsModePreviewKind }) {
  const light = (
    <WindowChrome
      canvas={semanticColorLight.background.canvas}
      surface={semanticColorLight.background.surface}
      muted={semanticColorLight.background.muted}
      border={semanticColorLight.border.default}
      accent={semanticColorLight.action.primary}
    />
  );
  const dark = (
    <WindowChrome
      canvas={semanticColorDark.background.canvas}
      surface={semanticColorDark.background.surface}
      muted={semanticColorDark.background.muted}
      border={semanticColorDark.border.default}
      accent={semanticColorDark.action.primary}
    />
  );

  if (kind === 'light') return light;
  if (kind === 'dark') return dark;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'relative',
        width: 64,
        height: 44,
        borderRadius: '7px',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
        {light}
      </Box>
      <Box sx={{ position: 'absolute', inset: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
        {dark}
      </Box>
    </Box>
  );
}
