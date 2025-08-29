import path from 'path';

import { LocalStorage } from './local';

let _storage: LocalStorage | undefined;

export function getStorage(): LocalStorage {
  if (_storage) {
    return _storage;
  }

  // Different storage paths for development vs production
  const isDev = process.env.NODE_ENV === 'development';

  const rootDir = isDev
    ? path.join(process.cwd(), 'public/uploads') // Dev: store in public for direct access
    : process.env.LOCAL_STORAGE_ROOT || '/app/data/uploads'; // Production: use data directory

  const publicUrl = isDev
    ? 'http://localhost:3000' // Dev: full URL for localhost
    : process.env.LOCAL_STORAGE_PUBLIC_URL || '/files/uploads'; // Production: relative path

  _storage = new LocalStorage(rootDir, publicUrl);
  return _storage;
}

// Export the storage instance directly for convenience
export const storage = getStorage();
