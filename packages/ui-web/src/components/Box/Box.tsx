/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Box/Box.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-09-29
 * ║ Purpose: Layout Box using the MUI spacing scale from design tokens
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import MuiBox from '@mui/material/Box';
import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { spacingScale, type SpacingKey } from '../../theme/spacing';

export type BoxProps = {
  as?: ElementType;
  p?: SpacingKey;
  px?: SpacingKey;
  py?: SpacingKey;
  m?: SpacingKey;
  mx?: SpacingKey;
  my?: SpacingKey;
  gap?: SpacingKey;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'style' | 'children'>;

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { as, p, px, py, m, mx, my, gap, children, style, ...rest },
  ref,
) {
  return (
    <MuiBox
      ref={ref}
      component={as ?? 'div'}
      sx={{
        boxSizing: 'border-box',
        minWidth: 0,
        p: spacingScale(p),
        px: spacingScale(px),
        py: spacingScale(py),
        m: spacingScale(m),
        mx: spacingScale(mx),
        my: spacingScale(my),
        gap: spacingScale(gap),
      }}
      style={style}
      {...rest}
    >
      {children}
    </MuiBox>
  );
});
