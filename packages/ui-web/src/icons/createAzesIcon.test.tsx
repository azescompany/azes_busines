/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/icons/createAzesIcon.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: createAzesIcon factory renders a named SvgIcon
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAzesIcon } from './createAzesIcon';

describe('createAzesIcon', () => {
  it('creates a named SvgIcon component', () => {
    const IconLogo = createAzesIcon('M0 0h24v24H0z', 'Logo');
    render(<IconLogo titleAccess="AZES" />);
    expect(screen.getByTitle('AZES')).toBeInTheDocument();
  });
});
