import { appVersion } from '@/lib/version';

export function VersionBadge() {
  return (
    <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
      v{appVersion}
    </span>
  );
}
