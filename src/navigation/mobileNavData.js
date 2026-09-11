import { CalendarDays, LineChart, CircleDot, Settings } from 'lucide-react';

export const MOBILE_NAV_ITEMS = [
  {
    id: 'schedule',
    label: 'Principal',
    icon: CalendarDays,
    match: (pathname) => pathname === '/dashboard',
    getPath: () => '/dashboard',
  },
  {
    id: 'stats',
    label: 'Finanzas',
    icon: LineChart,
    match: (pathname) => pathname === '/finance',
    getPath: () => '/finance',
  },
  {
    id: 'courts',
    label: 'Canchas',
    icon: CircleDot,
    match: (pathname) => pathname.startsWith('/canchas'),
    getPath: () => '/canchas',
  },
  {
    id: 'settings',
    label: 'Ajustes',
    icon: Settings,
    match: () => false,
    action: 'settings',
  },
];

export function getActiveMobileNavId(pathname, settingsOpen = false) {
  if (settingsOpen) return 'settings';
  const item = MOBILE_NAV_ITEMS.find((nav) => nav.match?.(pathname));
  return item?.id ?? 'schedule';
}
