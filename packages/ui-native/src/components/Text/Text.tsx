/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/Text/Text.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Native Text primitive with design-token typography
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { forwardRef } from 'react';
import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import {
  fontSizePx,
  fontWeightValue,
  type TextSize,
  type TextWeight,
} from '../../lib/typography.js';
import { useTheme } from '../../theme/ThemeProvider.js';

export type { TextSize, TextWeight };

export type TextTone = 'primary' | 'secondary' | 'muted' | 'inverse' | 'link';

export type TextProps = RNTextProps & {
  tone?: TextTone;
  size?: TextSize;
  weight?: TextWeight;
  style?: StyleProp<TextStyle>;
};

export const Text = forwardRef<RNText, TextProps>(function Text(
  { tone = 'primary', size = 'md', weight = 'regular', style, ...rest },
  ref,
) {
  const theme = useTheme();

  const color = theme.color.foreground[tone];

  return (
    <RNText
      ref={ref}
      accessibilityRole="text"
      style={[
        {
          color,
          fontSize: fontSizePx(size),
          fontWeight: fontWeightValue(weight),
          lineHeight: fontSizePx(size) * Number(theme.typography.lineHeight.normal),
        },
        style,
      ]}
      {...rest}
    />
  );
});
