/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/SettingsColorSwatchGrid.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-06
 * ║ Purpose: Primary color option cards (seed swatch + icon + name)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import AnchorOutlinedIcon from '@mui/icons-material/AnchorOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import Box from '@mui/material/Box';
import { type KeyboardEvent, type ReactElement } from 'react';

import { brandSeedOrder, brandSeeds, type BrandSeedName } from '../theme/brand';

export type SettingsColorSwatchGridProps = {
  label: string;
  selectedSeed: BrandSeedName | null;
  onSelect: (name: BrandSeedName) => void;
};

const SEED_ICONS: Record<BrandSeedName, ReactElement> = {
  teal: <WaterDropOutlinedIcon />,
  navy: <AnchorOutlinedIcon />,
  blue: <CloudOutlinedIcon />,
  indigo: <AutoAwesomeOutlinedIcon />,
  violet: <AutoFixHighOutlinedIcon />,
  green: <EnergySavingsLeafOutlinedIcon />,
  emerald: <DiamondOutlinedIcon />,
  amber: <WbSunnyOutlinedIcon />,
  orange: <LocalFireDepartmentOutlinedIcon />,
  red: <FavoriteBorderOutlinedIcon />,
  rose: <LocalFloristOutlinedIcon />,
  slate: <LandscapeOutlinedIcon />,
};

export function SettingsColorSwatchGrid({
  label,
  selectedSeed,
  onSelect,
}: SettingsColorSwatchGridProps) {
  function move(delta: number) {
    const index = selectedSeed ? brandSeedOrder.indexOf(selectedSeed) : 0;
    const next =
      brandSeedOrder[(index + delta + brandSeedOrder.length) % brandSeedOrder.length] ??
      brandSeedOrder[0];
    if (next) onSelect(next);
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

  return (
    <Box
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '10px',
        [theme.breakpoints.up('sm')]: {
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        },
      })}
    >
      {brandSeedOrder.map((name) => {
        const color = brandSeeds[name];
        const selected = selectedSeed === name;
        return (
          <Box
            key={name}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={name}
            tabIndex={selected || (!selectedSeed && name === brandSeedOrder[0]) ? 0 : -1}
            onClick={() => onSelect(name)}
            sx={(theme) => ({
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              minHeight: 40,
              minWidth: 0,
              paddingInline: '10px',
              paddingBlock: '14px',
              margin: 0,
              borderWidth: selected ? 1.5 : 1,
              borderStyle: 'solid',
              borderColor: selected ? theme.vars.palette.primary.main : theme.vars.palette.divider,
              borderRadius: '12px',
              backgroundColor: selected
                ? `color-mix(in srgb, ${theme.vars.palette.primary.main} 8%, ${theme.vars.palette.background.paper})`
                : theme.vars.palette.background.paper,
              boxShadow: selected
                ? `0 0 0 3px color-mix(in srgb, ${theme.vars.palette.primary.main} 14%, transparent)`
                : 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              transition: theme.transitions.create(
                ['border-color', 'background-color', 'box-shadow', 'transform'],
                { duration: 160 },
              ),
              '&:hover': {
                borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.divider})`,
                transform: 'translateY(-1px)',
                boxShadow: selected
                  ? `0 0 0 3px color-mix(in srgb, ${theme.vars.palette.primary.main} 14%, transparent), 0 6px 16px color-mix(in srgb, ${theme.vars.palette.common.black} 10%, transparent)`
                  : `0 6px 16px color-mix(in srgb, ${theme.vars.palette.common.black} 10%, transparent)`,
                '& .azes-color-swatch': {
                  transform: 'scale(1.06)',
                },
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.vars.palette.primary.main}`,
                outlineOffset: 2,
              },
              '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': { transform: 'none' },
                '&:hover .azes-color-swatch': { transform: 'none' },
              },
            })}
          >
            {selected ? (
              <Box
                aria-hidden
                sx={(theme) => ({
                  position: 'absolute',
                  insetBlockStart: 6,
                  insetInlineEnd: 6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: theme.vars.palette.primary.main,
                  color: theme.vars.palette.primary.contrastText,
                  lineHeight: 0,
                })}
              >
                <CheckIcon sx={{ fontSize: 12 }} />
              </Box>
            ) : null}
            <Box
              aria-hidden
              className="azes-color-swatch"
              sx={(theme) => ({
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: color,
                border: `2px solid ${theme.vars.palette.background.paper}`,
                boxShadow: `0 2px 8px color-mix(in srgb, ${theme.vars.palette.common.black} 16%, transparent)`,
                display: 'grid',
                placeItems: 'center',
                color: theme.palette.getContrastText(color),
                transition: theme.transitions.create('transform', { duration: 160 }),
                '& .MuiSvgIcon-root': { fontSize: 18 },
              })}
            >
              {selected ? <CheckIcon /> : SEED_ICONS[name]}
            </Box>
            <Box
              component="span"
              sx={(theme) => ({
                fontSize: '11.5px',
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'center',
                textTransform: 'capitalize',
                color: selected
                  ? theme.vars.palette.primary.main
                  : theme.vars.palette.text.secondary,
              })}
            >
              {name}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
