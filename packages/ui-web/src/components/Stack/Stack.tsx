/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Stack/Stack.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-09-29
 * ║ Purpose: Flex stack layout on the MUI Box primitive
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { forwardRef, type CSSProperties } from 'react';

import type { SpacingKey } from '../../theme/spacing';
import { Box, type BoxProps } from '../Box/Box';

export type StackProps = Omit<BoxProps, 'gap'> & {
  direction?: 'column' | 'row';
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  gap?: SpacingKey;
};

export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { direction = 'column', align, justify, wrap = false, gap = 4, style, ...rest },
  ref,
) {
  return (
    <Box
      ref={ref}
      gap={gap}
      style={{
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align,
        justifyContent: justify,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    />
  );
});
