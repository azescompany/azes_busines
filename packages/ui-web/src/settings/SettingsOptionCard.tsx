/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/SettingsOptionCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-11
 * ║ Purpose: Premium selectable option cards for the settings drawer
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import CheckIcon from '@mui/icons-material/Check';
import Box from '@mui/material/Box';
import { type KeyboardEvent, type ReactNode } from 'react';

export type SettingsOptionItem = {
  value: string;
  label: string;
  icon?: ReactNode;
  preview?: ReactNode;
  disabled?: boolean;
  /** Optional sample typography (font presets). */
  sampleFontFamily?: string;
  /** Large glyph shown above the label when sampling a font (e.g. Ag). */
  sampleGlyph?: string;
  /** Short phrase rendered in the option's font stack. */
  sampleText?: string;
};

export type SettingsOptionColumns = 2 | 3 | 'auto';

export type SettingsOptionCardGroupProps = {
  label: string;
  value: string;
  options: readonly SettingsOptionItem[];
  columns: SettingsOptionColumns;
  onChange: (value: string) => void;
};

export function SettingsOptionCardGroup({
  label,
  value,
  options,
  columns,
  onChange,
}: SettingsOptionCardGroupProps) {
  function move(delta: number) {
    const enabled = options.filter((o) => !o.disabled);
    if (enabled.length === 0) return;
    const currentIndex = enabled.findIndex((o) => o.value === value);
    const next = enabled[(currentIndex + delta + enabled.length) % enabled.length] ?? enabled[0];
    if (next) onChange(next.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    }
  }

  const isFontSample = options.some((o) => Boolean(o.sampleFontFamily));

  return (
    <Box
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      sx={{
        display: 'grid',
        gridTemplateColumns:
          columns === 'auto'
            ? isFontSample
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fill, minmax(140px, 1fr))'
            : `repeat(${columns}, minmax(0, 1fr))`,
        gap: isFontSample ? '8px' : '10px',
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const showFontSample = Boolean(option.sampleFontFamily);
        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            disabled={option.disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!option.disabled) onChange(option.value);
            }}
            sx={(theme) => ({
              position: 'relative',
              display: 'flex',
              flexDirection: showFontSample ? 'row' : 'column',
              alignItems: showFontSample ? 'center' : 'center',
              justifyContent: showFontSample ? 'flex-start' : 'center',
              gap: showFontSample ? 1 : 1,
              minHeight: showFontSample ? 52 : 72,
              paddingInline: showFontSample ? '10px' : '10px',
              paddingBlock: showFontSample ? '8px' : '14px',
              paddingInlineEnd: showFontSample ? '22px' : '10px',
              margin: 0,
              fontFamily: option.sampleFontFamily,
              borderWidth: selected ? 1.5 : 1,
              borderStyle: 'solid',
              borderColor: selected ? theme.vars.palette.primary.main : theme.vars.palette.divider,
              borderRadius: showFontSample ? '10px' : '12px',
              backgroundColor: selected
                ? `color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, ${theme.vars.palette.background.paper})`
                : theme.vars.palette.background.paper,
              color: selected ? theme.vars.palette.primary.main : theme.vars.palette.text.primary,
              boxShadow: selected
                ? `0 0 0 2px color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`
                : 'none',
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.48 : 1,
              appearance: 'none',
              WebkitAppearance: 'none',
              transition: theme.transitions.create(
                ['border-color', 'background-color', 'box-shadow', 'transform', 'color'],
                { duration: 160 },
              ),
              '&:hover': option.disabled
                ? undefined
                : {
                    borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.divider})`,
                    transform: showFontSample ? 'none' : 'translateY(-1px)',
                    boxShadow: selected
                      ? `0 0 0 2px color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`
                      : showFontSample
                        ? `0 0 0 1px color-mix(in srgb, ${theme.vars.palette.primary.main} 18%, transparent)`
                        : `0 6px 16px color-mix(in srgb, ${theme.vars.palette.common.black} 10%, transparent)`,
                  },
              '&:focus-visible': {
                outline: `2px solid ${theme.vars.palette.primary.main}`,
                outlineOffset: 2,
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': { transform: 'none' },
              },
            })}
          >
            {selected ? (
              <Box
                aria-hidden
                sx={(theme) => ({
                  position: 'absolute',
                  insetBlockStart: showFontSample ? 5 : 6,
                  insetInlineEnd: showFontSample ? 5 : 6,
                  width: showFontSample ? 14 : 18,
                  height: showFontSample ? 14 : 18,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: theme.vars.palette.primary.main,
                  color: theme.vars.palette.primary.contrastText,
                  lineHeight: 0,
                })}
              >
                <CheckIcon sx={{ fontSize: showFontSample ? 10 : 12 }} />
              </Box>
            ) : null}
            {!showFontSample &&
              (option.preview ??
                (option.icon ? (
                  <Box
                    aria-hidden
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      lineHeight: 0,
                      fontSize: 22,
                      color: 'inherit',
                      '& .MuiSvgIcon-root': { fontSize: 'inherit' },
                    }}
                  >
                    {option.icon}
                  </Box>
                ) : null))}
            {showFontSample ? (
              <>
                <Box
                  component="span"
                  aria-hidden
                  sx={(theme) => ({
                    flex: '0 0 auto',
                    width: 34,
                    height: 34,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '8px',
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    fontFamily: option.sampleFontFamily,
                    color: 'inherit',
                    backgroundColor: selected
                      ? `color-mix(in srgb, ${theme.vars.palette.primary.main} 12%, transparent)`
                      : `color-mix(in srgb, ${theme.vars.palette.text.primary} 5%, ${theme.vars.palette.background.paper})`,
                  })}
                >
                  {option.sampleGlyph ?? 'Ag'}
                </Box>
                <Box
                  component="span"
                  sx={{
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0.15,
                    fontFamily: option.sampleFontFamily,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {option.label}
                  </Box>
                  {option.sampleText ? (
                    <Box
                      component="span"
                      sx={(theme) => ({
                        fontSize: 10.5,
                        fontWeight: 500,
                        lineHeight: 1.2,
                        color: selected ? 'inherit' : theme.vars.palette.text.secondary,
                        opacity: selected ? 0.85 : 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      })}
                    >
                      {option.sampleText}
                    </Box>
                  ) : null}
                </Box>
              </>
            ) : (
              <Box
                component="span"
                sx={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                {option.label}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
