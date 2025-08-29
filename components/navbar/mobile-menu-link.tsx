import Link from 'next/link';

import type { MobileMenuLinkProps } from './types';

export function MobileMenuLink({
  item,
  isActive,
  onClose,
}: MobileMenuLinkProps) {
  const baseClasses = 'block rounded-md px-3 py-2 text-sm transition-colors';
  const activeClasses = isActive
    ? 'bg-accent text-accent-foreground'
    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground';

  return (
    <Link
      href={item.href || '/'}
      className={`${baseClasses} ${activeClasses}`}
      onClick={onClose}
    >
      {item.label}
    </Link>
  );
}
