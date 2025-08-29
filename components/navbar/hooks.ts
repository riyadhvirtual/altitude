import { useMemo } from 'react';

import { hasRequiredRole } from '@/lib/roles';

import { ADMIN_NAV_ITEMS, PILOT_NAV_ITEMS } from './constants';
import type { NavItem } from './types';

export const useNavItems = (
  basePath: string,
  userRoles: string[] | string | null,
  isAdminRoute: boolean
) =>
  useMemo(() => {
    const navItems = isAdminRoute ? ADMIN_NAV_ITEMS : PILOT_NAV_ITEMS;

    const filteredItems = navItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return hasRequiredRole(userRoles, item.roles);
    });

    return filteredItems.map((item) => ({
      ...item,
      href: item.href ? `${basePath}${item.href}` : item.href,
      children: item.children?.map((c) => ({
        ...c,
        href: `${basePath}${c.href}`,
      })),
    }));
  }, [basePath, userRoles, isAdminRoute]);

export const useActiveIndex = (
  navItems: NavItem[],
  pathname: string,
  basePath: string
) =>
  useMemo(() => {
    const cleanPathname = pathname.replace(basePath, '');

    const byChildIndex = navItems.findIndex((i) =>
      i.children?.some((c) => {
        const childHref = c.href.replace(basePath, '');
        return (
          cleanPathname === childHref ||
          cleanPathname.startsWith(childHref + '/')
        );
      })
    );

    if (byChildIndex !== -1) {
      return byChildIndex;
    }

    const activeIndex = navItems.findIndex((i) => {
      if (!i.href) {
        return false;
      }

      const itemHref = i.href.replace(basePath, '');
      const itemPath = itemHref.split('/').slice(0, 3).join('/');
      const currentPath = cleanPathname.split('/').slice(0, 3).join('/');

      return (
        cleanPathname === itemHref ||
        cleanPathname.startsWith(itemHref + '/') ||
        currentPath === itemPath
      );
    });

    return activeIndex !== -1 ? activeIndex : null;
  }, [navItems, pathname, basePath]);
