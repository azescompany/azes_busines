/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/locale/AzesLocaleMenu.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-19
 * ║ Purpose: Compact locale menu built on AzesMenu (no i18n / no flags)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import { IconGlobe } from '../icons';
import { AzesMenu } from '../menu/AzesMenu';

export type AzesLocaleMenuOption = {
  code: string;
  label: string;
  shortLabel?: string;
  /** @deprecated Flag emojis are not rendered. Kept for API compatibility. */
  flag?: string;
};

export type AzesLocaleMenuProps = {
  value: string;
  options: readonly AzesLocaleMenuOption[];
  onChange: (code: string) => void;
  /** Accessible label for the trigger. */
  label?: string;
  /**
   * `nav` — contrast/integrated chrome (`--azes-nav-*`).
   * `default` — paper surface.
   */
  surface?: 'default' | 'nav';
};

/**
 * Locale control for app bars. Prefer app-owned `LanguageMenu` when the app
 * needs i18n wiring; this package helper stays framework-agnostic.
 */
export function AzesLocaleMenu({
  value,
  options,
  onChange,
  label = 'Language',
  surface = 'default',
}: AzesLocaleMenuProps) {
  const current = options.find((option) => option.code === value) ?? options[0];
  const onNav = surface === 'nav';

  const items = useMemo(
    () =>
      options.map((option) => ({
        id: option.code,
        label: option.label,
        endAdornment: option.shortLabel ?? option.code.toUpperCase(),
        selected: option.code === value,
        onSelect: () => {
          onChange(option.code);
        },
      })),
    [onChange, options, value],
  );

  return (
    <AzesMenu
      aria-label={label}
      selectionMode="single"
      placement="bottom-end"
      width="sm"
      items={items}
      trigger={({ props, onClick }) => (
        <Button
          {...props}
          type="button"
          size="small"
          color="inherit"
          aria-label={label}
          onClick={onClick}
          startIcon={<IconGlobe fontSize="small" />}
          sx={(theme) => ({
            minWidth: 0,
            px: onNav ? 1.25 : 1.25,
            gap: 0.75,
            minHeight: theme.spacing(4.5),
            // Explicit px — never a bare number (MUI multiplies by shape.borderRadius).
            borderRadius: `${theme.shape.radiusMd}px`,
            textTransform: 'none',
            border: onNav
              ? '1px solid color-mix(in srgb, var(--azes-nav-text-strong) 28%, transparent)'
              : `1px solid ${theme.vars.palette.border.default}`,
            bgcolor: onNav ? 'transparent' : theme.vars.palette.background.paper,
            color: onNav ? 'var(--azes-nav-text-strong)' : 'inherit',
            '&:hover': onNav
              ? {
                  bgcolor: 'var(--azes-nav-hover)',
                  borderColor: 'color-mix(in srgb, var(--azes-nav-text-strong) 45%, transparent)',
                }
              : {
                  borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.border.default})`,
                  bgcolor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, ${theme.vars.palette.background.paper})`,
                },
          })}
        >
          <Typography
            component="span"
            variant="caption"
            sx={(theme) => ({
              fontWeight: theme.typography.fontWeightBold,
            })}
          >
            {current?.shortLabel ?? value.toUpperCase()}
          </Typography>
        </Button>
      )}
    />
  );
}
