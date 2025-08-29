import { Skeleton } from '@/components/ui/skeleton';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { useSession } from '@/lib/auth-client';

export function NavbarUser() {
  const { data: session, isPending } = useSession();

  if (isPending || !session?.user) {
    return <UserSkeleton />;
  }

  return <UserDropdown user={session.user} />;
}

function UserSkeleton() {
  return (
    <button
      aria-label="Account"
      className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted/50 shadow-sm ring-1 ring-border/60 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <Skeleton className="h-8 w-8 rounded-full" />
    </button>
  );
}
