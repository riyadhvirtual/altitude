'use client';

import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useAirlineLogo } from '@/components/providers/airline-logo-provider';
import { Button } from '@/components/ui/button';

import { MobileMenuDropdown } from './mobile-menu-dropdown';
import { MobileMenuLink } from './mobile-menu-link';
import type { MobileMenuProps, NavItem } from './types';

export function MobileMenu({
  items,
  pathname,
  onClose,
  isAdminRoute,
}: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isPathActive = useCallback(
    (item: NavItem) => {
      if (item.href) {
        if (pathname === item.href || pathname.startsWith(item.href + '/')) {
          return true;
        }

        const itemPath = item.href.split('/').slice(0, 3).join('/');
        const currentPath = pathname.split('/').slice(0, 3).join('/');
        if (itemPath === currentPath) {
          return true;
        }
      }

      if (item.children?.length) {
        return item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + '/')
        );
      }

      return false;
    },
    [pathname]
  );

  const toggleExpanded = useCallback((itemKey: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    const activeDropdown = items.find((item) => {
      if (!item.children?.length) {
        return false;
      }
      return item.children.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + '/')
      );
    });

    if (activeDropdown) {
      setExpandedItems((prev) => new Set([...prev, activeDropdown.key]));
    }
  }, [pathname, items]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border/60 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <img
            src={useAirlineLogo('light')}
            alt="Airline Logo (light)"
            width={22}
            height={22}
            className="h-5 w-5 rounded-sm object-contain block dark:hidden"
          />
          <img
            src={useAirlineLogo('dark')}
            alt="Airline Logo (dark)"
            width={22}
            height={22}
            className="h-5 w-5 rounded-sm object-contain hidden dark:block"
          />
          <span className="text-sm font-medium text-muted-foreground">
            {isAdminRoute ? 'Admin Menu' : 'Menu'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 sm:px-6 lg:px-8 py-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = isPathActive(item);
            const hasChildren = !!item.children?.length;
            const isExpanded = expandedItems.has(item.key);

            return (
              <li key={item.key}>
                {hasChildren ? (
                  <MobileMenuDropdown
                    item={item}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpanded(item.key)}
                    pathname={pathname}
                    onClose={onClose}
                  />
                ) : (
                  <MobileMenuLink
                    item={item}
                    isActive={isActive}
                    onClose={onClose}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
