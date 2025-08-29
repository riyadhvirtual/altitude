'use client';

import { BadgeCheck, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { signOut } from '@/lib/auth-client';

interface UserDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    verified?: boolean;
    role?: string | string[] | null;
    discordUsername?: string | null;
    discourseUsername?: string | null;
    infiniteFlightId?: string | null;
  };
}

function UserDropdownHeader({ user }: UserDropdownProps) {
  return (
    <DropdownMenuLabel className="p-0 font-normal">
      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
        <UserAvatar user={user} className="h-8 w-8" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
      </div>
    </DropdownMenuLabel>
  );
}

interface ThemeSubmenuProps {
  theme: string;
  setTheme: (theme: string) => void;
}

function ThemeSubmenu({ theme, setTheme }: ThemeSubmenuProps) {
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Sun className="dark:-rotate-90 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0 text-current" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-current" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="h-4 w-4 text-current" />
            <span>{label}</span>
            {theme === value && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/login');
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account"
          className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted/50 shadow-sm ring-1 ring-border/60 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <UserAvatar user={user} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-lg"
        sideOffset={4}
      >
        <UserDropdownHeader user={user} />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <BadgeCheck className="h-4 w-4 text-current" />
              Settings
            </Link>
          </DropdownMenuItem>
          <ThemeSubmenu theme={theme || 'system'} setTheme={setTheme} />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 text-current" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
