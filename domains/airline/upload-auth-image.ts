import { eq } from 'drizzle-orm';
import sharp from 'sharp';

import { db } from '@/db';
import { airline } from '@/db/schema';
import { IMAGE_MAX_MB } from '@/lib/constants';
import { getStorage } from '@/lib/storage';

interface UploadAuthBrandingData {
  file: File;
}

export async function uploadAuthBranding({
  file,
}: UploadAuthBrandingData): Promise<string> {
  const maxSize = IMAGE_MAX_MB * 1024 * 1024;
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  if (!allowedMime.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const processed = await sharp(buffer).webp({ quality: 88 }).toBuffer();

  const storage = getStorage();
  const key = `auth/auth-${Date.now()}.webp`;

  const result = await storage.put(processed, key, 'image/webp', {
    maxBytes: maxSize,
    allowedMime: ['image/webp'],
  });

  const [airlineRow] = await db.select().from(airline).limit(1);
  if (!airlineRow) {
    throw new Error('Airline not found');
  }

  const currentAuthImageUrl = airlineRow.authImageUrl;

  let oldKey: string | null = null;
  if (currentAuthImageUrl) {
    const match = currentAuthImageUrl.match(/\/(auth\/[^/]+\.webp)$/);
    if (match) {
      oldKey = match[1];
    }
  }

  const urlToStore = `/${result.url}`;

  await db.transaction(async (tx) => {
    await tx
      .update(airline)
      .set({
        authImageUrl: urlToStore,
        updatedAt: new Date(),
      })
      .where(eq(airline.id, airlineRow.id));

    // Delete old file if it exists
    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch {
        // Silently fail, old auth image cleanup is not critical
      }
    }
  });

  return urlToStore;
}

export async function removeAuthBranding(): Promise<void> {
  const storage = getStorage();

  const [airlineRow] = await db.select().from(airline).limit(1);
  if (!airlineRow) {
    throw new Error('Airline not found');
  }

  const currentAuthImageUrl = airlineRow.authImageUrl;
  let oldKey: string | null = null;
  if (currentAuthImageUrl) {
    const match = currentAuthImageUrl.match(/\/(auth\/[^/]+\.webp)$/);
    if (match) {
      oldKey = match[1];
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .update(airline)
      .set({ authImageUrl: null, updatedAt: new Date() })
      .where(eq(airline.id, airlineRow.id));

    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch {
        // Non-critical cleanup failure
      }
    }
  });
}
