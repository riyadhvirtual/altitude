import Link from 'next/link';

import type { NavLinkProps } from './types';

export function NavLink({ item, isActive }: NavLinkProps) {
  const baseClasses =
    'relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 h-[28px]';

  const activeClasses = isActive
    ? 'text-foreground'
    : 'text-muted-foreground hover:text-foreground';

  return (
    <Link
      href={item.href || '/'}
      prefetch={true}
      aria-current={isActive ? 'page' : undefined}
      className={`${baseClasses} ${activeClasses}`}
    >
      <span className="relative whitespace-nowrap flex items-center justify-center h-full">
        {item.label}
      </span>
    </Link>
  );
}
