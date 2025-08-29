const ABSOLUTE_RE = /^https?:\/\//i;

function publicBase(): string {
  const isDev = process.env.NODE_ENV === 'development';

  const base = isDev
    ? '/uploads'
    : process.env.LOCAL_STORAGE_PUBLIC_URL || '/files';

  return base.replace(/\/+$/, '');
}

function storageUrl(
  key?: string | null,
  fallback: string | null = null
): string | null {
  if (!key) {
    return fallback;
  }

  if (ABSOLUTE_RE.test(key)) {
    return key;
  }

  return `${publicBase()}/${String(key).replace(/^\/+/, '')}`;
}

export function fileUrl(key?: string | null): string {
  return storageUrl(key, '/fallback_dark.svg')!;
}

export function userAvatarUrl(key?: string | null): string | null {
  return storageUrl(key, null);
}
