import type { NavItem } from './types';

export const PILOT_NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'pireps', label: 'PIREPs', href: '/pireps' },
  { key: 'logbook', label: 'Logbook', href: '/logbook' },
  { key: 'routes', label: 'Routes', href: '/routes' },
  { key: 'events', label: 'Events', href: '/events' },
  { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
  {
    key: 'leave',
    label: 'Leave Requests',
    href: '/leave',
    children: [
      { key: 'leave-new', label: 'Request Leave', href: '/leave/new' },
      { key: 'leave-mine', label: 'My Leave', href: '/leave' },
    ],
  },
  {
    key: 'admin',
    label: 'Admin',
    href: '/admin/pireps/status/approved',
    roles: [
      'pireps',
      'fleet',
      'multipliers',
      'routes',
      'ranks',
      'events',
      'users',
      'admin',
    ],
  },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    key: 'pireps',
    label: 'PIREPs',
    href: '/admin/pireps/status/approved',
    roles: ['pireps'],
  },
  {
    key: 'fleet',
    label: 'Fleet',
    href: '/admin/fleet',
    roles: ['fleet'],
  },
  {
    key: 'multipliers',
    label: 'Multipliers',
    href: '/admin/multipliers',
    roles: ['multipliers'],
  },
  {
    key: 'routes',
    label: 'Routes',
    href: '/admin/routes',
    roles: ['routes'],
  },
  {
    key: 'ranks',
    label: 'Ranks',
    href: '/admin/ranks',
    roles: ['ranks'],
  },
  {
    key: 'events',
    label: 'Events',
    href: '/admin/events',
    roles: ['events'],
  },
  {
    key: 'statistics',
    label: 'Statistics',
    href: '/admin/statistics',
    roles: ['users'],
  },
  {
    key: 'inactivity',
    label: 'Inactivity',
    href: '/admin/inactivity',
    roles: ['users'],
  },
  {
    key: 'leave',
    label: 'Leave',
    href: '/admin/leave',
    roles: ['users'],
  },
  {
    key: 'users',
    label: 'Users',
    href: '/admin/users',
    roles: ['users'],
    children: [
      { key: 'users', label: 'Users', href: '/admin/users' },
      {
        key: 'applications',
        label: 'Applications',
        href: '/admin/applications',
      },
    ],
  },
  {
    key: 'settings',
    label: 'VA Settings',
    href: '/admin/settings',
    roles: ['admin'],
  },
];

export const HOVER_DELAY = 150;
export const ANIMATION_CONFIG = {
  duration: 0.12,
  ease: [0.4, 0, 0.2, 1] as const,
};
