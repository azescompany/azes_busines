/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/modules/iconMap.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: iconKey → @azes/ui-web/icons for module tiles
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  IconAccountBalance,
  IconApps,
  IconBadge,
  IconBarcode,
  IconBeach,
  IconCalendar,
  IconCampaign,
  IconCart,
  IconChat,
  IconContact,
  IconDashboard,
  IconDocs,
  IconDocument,
  IconDraw,
  IconEmail,
  IconEvent,
  IconEventAvailable,
  IconFactory,
  IconGlobe,
  IconHandshake,
  IconHome,
  IconInventory,
  IconKey,
  IconManufacturing,
  IconNavigation,
  IconPayments,
  IconPeople,
  IconPersonSearch,
  IconPointOfSale,
  IconReceipt,
  IconRestaurant,
  IconSchedule,
  IconSettings,
  IconSell,
  IconSubscriptions,
  IconSupportAgent,
  IconTask,
  type AzesIcon,
} from '@azes/ui-web/icons';
import { createElement, type ReactElement } from 'react';

const ICON_MAP: Record<string, AzesIcon> = {
  chat: IconChat,
  calendar: IconCalendar,
  appointments: IconEventAvailable,
  todo: IconTask,
  knowledge: IconDocs,
  contacts: IconContact,
  crm: IconHandshake,
  sales: IconSell,
  dashboards: IconDashboard,
  subscriptions: IconSubscriptions,
  rental: IconKey,
  pos: IconPointOfSale,
  kitchen: IconRestaurant,
  accounting: IconAccountBalance,
  documents: IconDocument,
  project: IconNavigation,
  timesheets: IconSchedule,
  planning: IconEvent,
  helpdesk: IconSupportAgent,
  website: IconGlobe,
  email_marketing: IconCampaign,
  events: IconEmail,
  purchase: IconCart,
  inventory: IconInventory,
  manufacturing: IconManufacturing,
  shop_floor: IconFactory,
  barcode: IconBarcode,
  sign: IconDraw,
  employees: IconPeople,
  recruitment: IconPersonSearch,
  time_off: IconBeach,
  payroll: IconPayments,
  expenses: IconReceipt,
  apps: IconApps,
  settings: IconSettings,
  badge: IconBadge,
  home: IconHome,
};

export function resolveModuleIcon(
  iconKey: string | null | undefined,
  fontSize: 'small' | 'medium' | 'large' = 'medium',
): ReactElement {
  const Comp = (iconKey && ICON_MAP[iconKey]) || IconApps;
  return createElement(Comp, { fontSize }) as ReactElement;
}
