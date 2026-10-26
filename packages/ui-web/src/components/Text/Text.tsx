/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Text/Text.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-09-29
 * ║ Purpose: Typography text primitive mapped onto MUI Typography
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Typography, { type TypographyProps } from '@mui/material/Typography';
import { forwardRef, type ElementType, type HTMLAttributes } from 'react';

export type TextTone = 'primary' | 'secondary' | 'muted';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type TextProps = {
  as?: ElementType;
  tone?: TextTone;
  size?: TextSize;
  weight?: TextWeight;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'color'>;

const sizeVariant: Record<TextSize, TypographyProps['variant']> = {
  xs: 'caption',
  sm: 'body2',
  md: 'body1',
  lg: 'subtitle1',
  xl: 'h5',
  '2xl': 'h4',
};

const weightValue: Record<TextWeight, number> = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const toneColor: Record<TextTone, string> = {
  primary: 'text.primary',
  secondary: 'text.secondary',
  muted: 'text.muted',
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as, tone = 'primary', size = 'md', weight = 'regular', ...rest },
  ref,
) {
  return (
    <Typography
      ref={ref}
      component={as ?? 'p'}
      variant={sizeVariant[size]}
      sx={{ fontWeight: weightValue[weight], color: toneColor[tone], m: 0 }}
      {...rest}
    />
  );
});
