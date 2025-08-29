import { Avatar } from '@/components/ui/avatar';
import { userAvatarUrl } from '@/lib/urls';

interface UserAvatarProps {
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
  className?: string;
}

export function UserAvatar({ user, className = 'h-8 w-8' }: UserAvatarProps) {
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const avatarUrl = userAvatarUrl(user.image);

  return (
    <Avatar className={className}>
      {user.image ? (
        <img
          src={avatarUrl!}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10">
          <span className="font-medium text-primary text-sm">
            {userInitials}
          </span>
        </div>
      )}
    </Avatar>
  );
}
