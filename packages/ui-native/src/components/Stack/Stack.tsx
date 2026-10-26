/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-native/src/components/Stack/Stack.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Native flex Stack layout primitive
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { forwardRef } from 'react';
import { type FlexAlignType, type View, type ViewStyle } from 'react-native';

import { type SpacingKey } from '../../lib/spacing.js';
import { Box, type BoxProps } from '../Box/Box.js';

export type StackProps = BoxProps & {
  direction?: 'column' | 'row';
  align?: FlexAlignType;
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  gap?: SpacingKey;
};

export const Stack = forwardRef<View, StackProps>(function Stack(
  { direction = 'column', align, justify, wrap = false, gap = 4, style, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      gap={gap}
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...rest}
    />
  );
});
