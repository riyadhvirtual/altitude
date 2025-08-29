import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

import type { MobileMenuDropdownProps } from './types';

export function MobileMenuDropdown({
  item,
  isActive,
  isExpanded,
  onToggle,
  pathname,
  onClose,
}: MobileMenuDropdownProps) {
  const baseClasses =
    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors';
  const activeClasses = isActive
    ? 'bg-accent text-accent-foreground'
    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground';

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className={`${baseClasses} ${activeClasses}`}
      >
        <span className="font-medium">{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isExpanded && (
        <ul className="ml-4 space-y-1 relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border/60" />
          {item.children?.map((child) => {
            const childActive = pathname === child.href;

            return (
              <li key={child.key} className="relative">
                <Link
                  href={child.href}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors pl-4 ${
                    childActive
                      ? 'text-foreground underline underline-offset-4'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={onClose}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
