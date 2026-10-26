/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/Box/Box.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Native View layout primitive using design-token spacing
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { forwardRef } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { resolveSpacing, type SpacingKey } from '../../lib/spacing.js';
import { useTheme } from '../../theme/ThemeProvider.js';

export type BoxProps = ViewProps & {
  p?: SpacingKey;
  px?: SpacingKey;
  py?: SpacingKey;
  m?: SpacingKey;
  mx?: SpacingKey;
  my?: SpacingKey;
  gap?: SpacingKey;
  background?: 'canvas' | 'surface' | 'muted' | 'transparent';
  style?: StyleProp<ViewStyle>;
};

export const Box = forwardRef<View, BoxProps>(function Box(
  { p, px, py, m, mx, my, gap, background = 'transparent', style, ...rest },
  ref,
) {
  const theme = useTheme();

  const backgroundColor =
    background === 'transparent' ? undefined : theme.color.background[background];

  const resolvedStyle: ViewStyle = {
    padding: resolveSpacing(p),
    paddingHorizontal: resolveSpacing(px),
    paddingVertical: resolveSpacing(py),
    margin: resolveSpacing(m),
    marginHorizontal: resolveSpacing(mx),
    marginVertical: resolveSpacing(my),
    gap: resolveSpacing(gap),
    backgroundColor,
  };

  return <View ref={ref} style={[resolvedStyle, style].flat()} {...rest} />;
});
