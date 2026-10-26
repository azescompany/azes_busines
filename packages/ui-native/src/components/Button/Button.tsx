/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/Button/Button.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Accessible native Button built on Pressable + tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { primitives } from '@azes/design-tokens';
import { forwardRef, type ElementRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fontSizePx, fontWeightValue } from '../../lib/typography.js';
import { useTheme } from '../../theme/ThemeProvider.js';
import { Text } from '../Text/Text.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style' | 'disabled'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const sizeStyles: Record<
  ButtonSize,
  { minHeight: number; paddingHorizontal: number; fontSize: 'sm' | 'md' | 'lg' }
> = {
  sm: {
    minHeight: primitives.sizePx.controlSm,
    paddingHorizontal: primitives.spacingPx[3],
    fontSize: 'sm',
  },
  md: {
    minHeight: primitives.sizePx.controlMd,
    paddingHorizontal: primitives.spacingPx[4],
    fontSize: 'md',
  },
  lg: {
    minHeight: primitives.sizePx.controlLg,
    paddingHorizontal: primitives.spacingPx[5],
    fontSize: 'lg',
  },
};

export const Button = forwardRef<ElementRef<typeof Pressable>, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    style,
    accessibilityLabel,
    onPress,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const isDisabled = Boolean(disabled || loading);
  const metrics = sizeStyles[size];
  const resolvedLabel = accessibilityLabel ?? (typeof children === 'string' ? children : undefined);

  const palette = {
    primary: {
      background: theme.color.action.primary,
      pressed: theme.color.action.primaryActive,
      foreground: theme.color.action.primaryForeground,
    },
    secondary: {
      background: theme.color.action.secondary,
      pressed: theme.color.action.secondaryHover,
      foreground: theme.color.action.secondaryForeground,
    },
    ghost: {
      background: 'transparent',
      pressed: theme.color.background.muted,
      foreground: theme.color.foreground.primary,
    },
  }[variant];

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
          borderRadius: primitives.radiusPx.md,
          backgroundColor: pressed && !isDisabled ? palette.pressed : palette.background,
          opacity: isDisabled ? 0.5 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: primitives.spacingPx[2],
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          accessibilityElementsHidden
          importantForAccessibility="no"
          color={palette.foreground}
        />
      ) : null}
      {typeof children === 'string' ? (
        <Text
          tone="primary"
          size={metrics.fontSize}
          weight="semibold"
          style={{
            color: palette.foreground,
            fontSize: fontSizePx(metrics.fontSize),
            fontWeight: fontWeightValue('semibold'),
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});
