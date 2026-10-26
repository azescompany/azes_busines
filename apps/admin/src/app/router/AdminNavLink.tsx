/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/app/router/AdminNavLink.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: Bridge AzesNav `href` props to react-router `Link`
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router';

type NavLinkProps = ComponentPropsWithoutRef<'a'> & { href?: string };

export const AdminNavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function AdminNavLink(
  { href, ...rest },
  ref,
) {
  return <Link ref={ref} to={href ?? '/'} {...rest} />;
});
