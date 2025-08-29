import { db } from '@/db';
import { airline } from '@/db/schema';
import { getStorage } from '@/lib/storage';

import { addCustomTheme } from './themes';

function toSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'theme'
  );
}

interface UploadThemeData {
  file: File;
}

export async function uploadTheme({ file }: UploadThemeData): Promise<string> {
  const maxSize = 256 * 1024; // 256KB
  // Some environments report inconsistent MIME for CSS; rely on size + extension only
  if (file.size > maxSize) {
    throw new Error('Theme file too large (max 256KB)');
  }
  if (!file.name.toLowerCase().endsWith('.css')) {
    throw new Error('File must have .css extension');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = getStorage();
  const base = toSlug(file.name.replace(/\.css$/i, ''));
  const key = `themes/${base}-${Date.now()}.css`;

  await storage.put(buffer, key, 'text/css', {
    maxBytes: maxSize,
    // Persist as text/css regardless of incoming MIME
    allowedMime: ['text/css'],
  });

  const urlToStore = `/${key}`;

  await db.select().from(airline).limit(1);
  // Append to manifest for listing regardless of airline row presence
  await addCustomTheme({ name: base, url: urlToStore });

  return urlToStore;
}
