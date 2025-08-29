import { eq } from 'drizzle-orm';
import sharp from 'sharp';

import { db } from '@/db';
import { users } from '@/db/schema';
import { IMAGE_MAX_MB } from '@/lib/constants';
import { getStorage } from '@/lib/storage';

interface UploadAvatarData {
  userId: string;
  file: File;
}

export async function uploadAvatar({ userId, file }: UploadAvatarData) {
  const maxSize = IMAGE_MAX_MB * 1024 * 1024; // MB
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  if (!allowedMime.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Convert to WebP
  const buffer = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buffer).webp({ quality: 90 }).toBuffer();

  // Upload to storage
  const storage = getStorage();
  const key = `avatars/${userId}-${Date.now()}.webp`;

  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      throw new Error('User not found');
    }

    let oldKey: string | null = null;
    if (user.image) {
      const urlParts = user.image.split('/');
      const avatarIndex = urlParts.findIndex((part) => part === 'avatars');
      if (avatarIndex !== -1 && avatarIndex < urlParts.length - 1) {
        oldKey = `avatars/${urlParts[avatarIndex + 1]}`;
      }
    }

    const { url } = await storage.put(webp, key, 'image/webp', {
      maxBytes: maxSize,
      allowedMime,
    });

    await tx
      .update(users)
      .set({ image: url, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Delete old avatar if it exists
    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch {
        // Silently fail, old avatar cleanup is not critical
      }
    }

    return url;
  });
}

export async function deleteAvatar(userId: string) {
  const storage = getStorage();

  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      throw new Error('User not found');
    }

    let oldKey: string | null = null;
    if (user.image) {
      const urlParts = user.image.split('/');
      const avatarIndex = urlParts.findIndex((part) => part === 'avatars');
      if (avatarIndex !== -1 && avatarIndex < urlParts.length - 1) {
        oldKey = `avatars/${urlParts[avatarIndex + 1]}`;
      }
    }

    await tx
      .update(users)
      .set({ image: null, updatedAt: new Date() })
      .where(eq(users.id, userId));

    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch {
        // Silently fail, old avatar cleanup is not critical
      }
    }

    return true;
  });
}
