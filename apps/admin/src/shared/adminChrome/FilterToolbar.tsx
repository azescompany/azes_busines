/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/shared/adminChrome/FilterToolbar.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Search + filter chips toolbar for admin tables
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Chip, MuiBox, MuiButton, Stack, TextField } from '@azes/ui-web';
import type { ReactNode } from 'react';

export type FilterChip = {
  id: string;
  label: string;
  onDelete: () => void;
};

export type FilterToolbarProps = {
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: ReactNode;
  chips?: FilterChip[];
  clearLabel?: string;
  onClear?: () => void;
};

export function FilterToolbar({
  searchLabel,
  searchValue,
  onSearchChange,
  filters,
  chips = [],
  clearLabel,
  onClear,
}: FilterToolbarProps) {
  return (
    <Stack gap={2}>
      <MuiBox
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { md: 'center' },
        }}
      >
        <TextField
          size="small"
          label={searchLabel}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: { md: 240 }, flex: 1 }}
        />
        {filters ? (
          <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {filters}
          </MuiBox>
        ) : null}
      </MuiBox>
      {chips.length > 0 ? (
        <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {chips.map((c) => (
            <Chip key={c.id} size="small" label={c.label} onDelete={c.onDelete} />
          ))}
          {onClear && clearLabel ? (
            <MuiButton size="small" variant="text" onClick={onClear}>
              {clearLabel}
            </MuiButton>
          ) : null}
        </MuiBox>
      ) : null}
    </Stack>
  );
}
