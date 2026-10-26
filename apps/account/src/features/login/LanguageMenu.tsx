/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/LanguageMenu.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-11
 * ║ Updated: 2026-10-11
 * ║ Purpose: Login language switcher — onChrome vs onPaper contrast
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { MuiButton, Typography, useTheme } from '@azes/ui-web';
import { IconGlobe } from '@azes/ui-web/icons';
import { AzesMenu } from '@azes/ui-web/menu';
import { useMemo } from 'react';

import { ACCOUNT_LANGUAGES } from '../../shared/config/languages.js';

export type LanguageMenuProps = {
  value: string;
  onChange: (code: string) => void;
  'aria-label': string;
  /**
   * `onChrome` — same tokens as admin header (`--azes-nav-text-strong`).
   * `onPaper` / `canvas` — paper surface (`text.primary`).
   */
  tone?: 'onChrome' | 'onPaper' | 'nav' | 'canvas';
};

function resolveTone(tone: LanguageMenuProps['tone']): 'onChrome' | 'onPaper' {
  if (tone === 'onChrome' || tone === 'nav') return 'onChrome';
  return 'onPaper';
}

export function LanguageMenu({
  value,
  onChange,
  'aria-label': ariaLabel,
  tone = 'onPaper',
}: LanguageMenuProps) {
  const theme = useTheme();
  const onChrome = resolveTone(tone) === 'onChrome';
  const current = ACCOUNT_LANGUAGES.find((option) => option.code === value) ?? ACCOUNT_LANGUAGES[0];
  const ink = onChrome ? 'var(--azes-nav-text-strong)' : theme.vars.palette.text.primary;

  const items = useMemo(
    () =>
      ACCOUNT_LANGUAGES.map((option) => ({
        id: option.code,
        label: option.label,
        endAdornment: option.shortLabel,
        selected: option.code === value,
        onSelect: () => {
          onChange(option.code);
        },
      })),
    [onChange, value],
  );

  return (
    <AzesMenu
      aria-label={ariaLabel}
      selectionMode="single"
      placement="bottom-end"
      width="sm"
      items={items}
      trigger={({ props, onClick }) => (
        <MuiButton
          {...props}
          type="button"
          size="small"
          color="inherit"
          aria-label={ariaLabel}
          onClick={onClick}
          startIcon={<IconGlobe fontSize="small" sx={{ color: ink }} />}
          sx={{
            minWidth: 0,
            minHeight: theme.spacing(4.5),
            px: 1.25,
            borderRadius: `${theme.shape.radiusMd}px`,
            border: onChrome
              ? '1px solid color-mix(in srgb, var(--azes-nav-text-strong) 28%, transparent)'
              : `1px solid ${theme.vars.palette.border.default}`,
            color: ink,
            bgcolor: onChrome ? 'transparent' : theme.vars.palette.background.paper,
            textTransform: 'none',
            gap: 0.75,
            '& .MuiButton-startIcon': { color: ink },
            '&:hover': onChrome
              ? {
                  bgcolor: 'var(--azes-nav-hover)',
                  borderColor: 'color-mix(in srgb, var(--azes-nav-text-strong) 45%, transparent)',
                  color: ink,
                }
              : {
                  borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.border.default})`,
                  bgcolor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, ${theme.vars.palette.background.paper})`,
                  color: theme.vars.palette.text.primary,
                },
            '&:focus-visible': {
              outline: `2px solid ${onChrome ? 'var(--azes-nav-text-strong)' : theme.vars.palette.border.focus}`,
              outlineOffset: 2,
            },
          }}
        >
          <Typography
            component="span"
            variant="caption"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              letterSpacing: theme.typography.caption.letterSpacing,
              color: ink,
            }}
          >
            {current?.shortLabel ?? value.toUpperCase()}
          </Typography>
        </MuiButton>
      )}
    />
  );
}
