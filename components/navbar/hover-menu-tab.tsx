'use client';

import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ANIMATION_CONFIG, HOVER_DELAY } from './constants';
import type { HoverMenuTabProps } from './types';

export function HoverMenuTab({
  item,
  isActive,
  setDropdownOpen,
}: HoverMenuTabProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearTimer();
    setOpen(true);
    setDropdownOpen?.(true);
  }, [clearTimer, setDropdownOpen]);

  const closeMenu = useCallback(() => {
    clearTimer();
    timer.current = window.setTimeout(() => {
      setOpen(false);
      setDropdownOpen?.(false);
    }, HOVER_DELAY);
  }, [clearTimer, setDropdownOpen]);

  useEffect(() => clearTimer, [clearTimer]);

  const baseClasses =
    'relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium tracking-tight transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 h-[28px]';

  const activeClasses =
    isActive || open ? 'text-foreground' : 'text-muted-foreground';

  return (
    <div
      className="group relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onFocus={openMenu}
      onBlur={closeMenu}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${baseClasses} ${activeClasses}`}
      >
        <span className="relative whitespace-nowrap flex items-center justify-center h-full">
          {item.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={ANIMATION_CONFIG}
            className="absolute left-0 top-[calc(100%+16px)] min-w-[200px] z-50"
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg ring-1 ring-border/50">
              <div className="p-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.key}
                    role="menuitem"
                    href={child.href}
                    prefetch
                    className="relative flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors text-card-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
