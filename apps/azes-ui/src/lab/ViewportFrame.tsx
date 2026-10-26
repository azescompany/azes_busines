/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/lab/ViewportFrame.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Demo-only viewport picker and content frame (the only Theme Lab leftover)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { FormControl, InputLabel, MenuItem, MuiBox, Select, Typography } from '@azes/ui-web';
import type { ReactNode } from 'react';

import { VIEWPORT_PRESETS, viewportWidthOf, type ViewportPresetId } from './viewport.js';

export function ViewportSelect({
  value,
  onChange,
}: {
  value: ViewportPresetId;
  onChange: (value: ViewportPresetId) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 110, display: { xs: 'none', md: 'flex' } }}>
      <InputLabel id="viewport-label">Viewport</InputLabel>
      <Select
        labelId="viewport-label"
        label="Viewport"
        value={value}
        onChange={(event) => onChange(event.target.value as ViewportPresetId)}
      >
        {VIEWPORT_PRESETS.map((preset) => (
          <MenuItem key={preset.id} value={preset.id}>
            {preset.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** Frames section content at a preset width. Layout media queries still follow the window. */
export function ViewportFrame({
  preset,
  children,
}: {
  preset: ViewportPresetId;
  children: ReactNode;
}) {
  const width = viewportWidthOf(preset);
  if (width === null) return <>{children}</>;
  return (
    <MuiBox sx={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Viewport preview {width}px
      </Typography>
      <MuiBox
        sx={{
          width,
          maxWidth: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 4,
          overflow: 'auto',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </MuiBox>
    </MuiBox>
  );
}
