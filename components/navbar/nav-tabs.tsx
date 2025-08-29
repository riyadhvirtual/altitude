'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

import { HoverMenuTab } from './hover-menu-tab';
import { NavLink } from './nav-link';
import type { NavItem, NavTabsProps } from './types';

export function NavTabs({
  items,
  pathname,
  activeIndex,
  isAdminRoute = false,
}: NavTabsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null
  );
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update hover styles
  useEffect(() => {
    const indexToHighlight =
      hoveredIndex !== null ? hoveredIndex : openDropdownIndex;
    if (indexToHighlight !== null) {
      const hoveredElement = tabRefs.current[indexToHighlight];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex, openDropdownIndex]);

  // Update active styles
  useEffect(() => {
    if (activeIndex !== null) {
      const activeElement = tabRefs.current[activeIndex];
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement;
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [activeIndex, items]);

  // Initialize active styles
  useEffect(() => {
    if (activeIndex !== null) {
      requestAnimationFrame(() => {
        const activeElement = tabRefs.current[activeIndex];
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement;
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          });
        }
      });
    }
  }, [activeIndex]);

  const handleMouseLeave = useCallback(() => {
    if (!dropdownOpen) {
      setHoveredIndex(null);
    }
  }, [dropdownOpen]);

  const handleDropdownOpen = useCallback((index: number, open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      setOpenDropdownIndex(index);
      setHoveredIndex(index);
    } else {
      setOpenDropdownIndex(null);
    }
  }, []);

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

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="relative flex w-full items-center"
      onMouseLeave={handleMouseLeave}
    >
      {isAdminRoute && (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="bg-nav-hover text-foreground hover:bg-nav-hover/70 mr-4"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pilot
          </Link>
        </Button>
      )}

      <div className="relative flex items-center">
        {/* Hover Highlight */}
        <div
          className="absolute h-[34px] -top-[3px] transition-all duration-300 ease-out bg-nav-hover rounded-sm pointer-events-none"
          style={{
            ...hoverStyle,
            opacity:
              hoveredIndex !== null || openDropdownIndex !== null ? 1 : 0,
          }}
        />

        {/* Active Indicator */}
        {activeIndex !== null && (
          <div
            className="absolute -bottom-4 h-[2px] bg-muted-foreground transition-all duration-300 ease-out pointer-events-none"
            style={activeStyle}
          />
        )}

        {/* Tabs */}
        <div className="relative flex items-center gap-1">
          {items.map((item, index) => {
            const hasDropdown = !!item.children?.length;
            const isActive = isPathActive(item);

            return (
              <div
                key={item.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
              >
                {hasDropdown ? (
                  <HoverMenuTab
                    item={item}
                    pathname={pathname}
                    isActive={isActive}
                    setDropdownOpen={(open) => handleDropdownOpen(index, open)}
                  />
                ) : (
                  <NavLink item={item} isActive={isActive} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
