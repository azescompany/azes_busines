/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/test/react-native-mock.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Lightweight react-native mock for Vitest (avoids Flow syntax)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createElement, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

type HostProps = {
  children?: ReactNode;
  style?: unknown;
  testID?: string;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityState?: Record<string, unknown>;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: string;
  disabled?: boolean;
  onPress?: (event: unknown) => void;
  [key: string]: unknown;
};

function createHost(name: string) {
  return forwardRef<unknown, HostProps>(function Host(props, ref) {
    return createElement(name, { ...props, ref });
  });
}

const View = createHost('View');
const Text = createHost('Text');
const ActivityIndicator = createHost('ActivityIndicator');

type PressableState = { pressed: boolean };

type RNPressableProps = HostProps & {
  children?: ReactNode | ((state: PressableState) => ReactNode);
  style?: HostProps['style'] | ((state: PressableState) => HostProps['style']);
};

const Pressable = forwardRef<unknown, RNPressableProps>(function Pressable(
  { children, style, disabled, onPress, ...rest },
  ref,
) {
  const state: PressableState = { pressed: false };
  const resolvedStyle = typeof style === 'function' ? style(state) : style;
  const resolvedChildren = typeof children === 'function' ? children(state) : children;

  return createElement('Pressable', {
    ...rest,
    ref,
    style: resolvedStyle,
    disabled,
    onPress: disabled ? undefined : onPress,
    children: resolvedChildren,
  });
});

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: (style: unknown) => style,
  hairlineWidth: 1,
  absoluteFill: {},
  absoluteFillObject: {},
};

export const Platform = {
  OS: 'ios' as const,
  select: <T,>(spec: { ios?: T; android?: T; default?: T }): T | undefined =>
    spec.ios ?? spec.default,
};

export { View, Text, Pressable, ActivityIndicator };

export type ViewProps = ComponentPropsWithoutRef<typeof View>;
export type TextProps = ComponentPropsWithoutRef<typeof Text>;
export type PressableProps = ComponentPropsWithoutRef<typeof Pressable>;
export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type StyleProp<T> = T | T[] | null | undefined | false;
export type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export default {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
};
