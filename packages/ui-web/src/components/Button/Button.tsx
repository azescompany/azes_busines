/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Button/Button.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-09-29
 * ║ Purpose: Button primitive mapped onto MUI Button
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
};

const muiVariant: Record<ButtonVariant, MuiButtonProps['variant']> = {
  primary: 'contained',
  secondary: 'text',
  ghost: 'outlined',
};

const muiSize: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, children, type, ...rest },
  ref,
) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <MuiButton
      ref={ref}
      type={type ?? 'button'}
      variant={muiVariant[variant]}
      size={muiSize[size]}
      color={variant === 'secondary' ? 'secondary' : 'primary'}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      startIcon={loading ? <CircularProgress color="inherit" size="1em" aria-hidden /> : undefined}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});
