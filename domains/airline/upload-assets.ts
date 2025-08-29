import { eq } from 'drizzle-orm';
import sharp from 'sharp';

import { db } from '@/db';
import { airline } from '@/db/schema';
import { getStorage } from '@/lib/storage';

async function createIcoFile(pngBuffers: Buffer[]): Promise<Buffer> {
  const sizes = [16, 32, 48];
  const headerSize = 6 + 16 * pngBuffers.length;
  const header = Buffer.alloc(headerSize);

  // ICO header
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  let offset = headerSize;

  // Write directory entries
  for (let i = 0; i < pngBuffers.length; i++) {
    const entryOffset = 6 + i * 16;
    const size = pngBuffers[i].length;

    header.writeUInt8(sizes[i], entryOffset); // Width
    header.writeUInt8(sizes[i], entryOffset + 1); // Height
    header.writeUInt8(0, entryOffset + 2); // Color count
    header.writeUInt8(0, entryOffset + 3); // Reserved
    header.writeUInt16LE(1, entryOffset + 4); // Color planes
    header.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    header.writeUInt32LE(size, entryOffset + 8); // Size
    header.writeUInt32LE(offset, entryOffset + 12); // Offset

    offset += size;
  }

  // Combine header and PNG data
  const icoBuffer = Buffer.concat([header, ...pngBuffers]);
  return icoBuffer;
}

interface UploadLogoData {
  logoType: 'light' | 'dark' | 'favicon';
  file: File;
}

export async function uploadAssets({
  logoType,
  file,
}: UploadLogoData): Promise<string> {
  const maxSize = 4 * 1024 * 1024;
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
  ];
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  if (!allowedMime.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let processedBuffer: Buffer;
  let fileExtension: string;
  let mimeType: string;

  if (logoType === 'favicon') {
    // For favicon, convert to ICO format
    const sizes = [16, 32, 48];
    const icoBuffers = await Promise.all(
      sizes.map(async (size) => {
        return await sharp(buffer).resize(size, size).png().toBuffer();
      })
    );

    // Create ICO file with multiple sizes
    processedBuffer = await createIcoFile(icoBuffers);
    fileExtension = 'ico';
    mimeType = 'image/x-icon';
  } else {
    // For logos, convert to WebP
    processedBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
    fileExtension = 'webp';
    mimeType = 'image/webp';
  }

  const storage = getStorage();
  const key = `logos/${logoType}-${Date.now()}.${fileExtension}`;

  const [airlineRow] = await db.select().from(airline).limit(1);
  if (!airlineRow) {
    throw new Error('Airline not found');
  }

  const logoUrlField =
    logoType === 'light'
      ? 'lightLogoUrl'
      : logoType === 'dark'
        ? 'darkLogoUrl'
        : 'faviconUrl';
  const currentLogoUrl = airlineRow[logoUrlField];

  // Extract the old key from the current URL if it exists
  let oldKey: string | null = null;
  if (currentLogoUrl) {
    const match = currentLogoUrl.match(/logos\/[^/]+\.(webp|ico)/);
    if (match) {
      oldKey = match[0];
    }
  }

  await storage.put(processedBuffer, key, mimeType, {
    maxBytes: maxSize,
    allowedMime,
  });

  // We only store the relative path
  const urlToStore = `/${key}`;

  await db.transaction(async (tx) => {
    await tx
      .update(airline)
      .set({
        [logoUrlField]: urlToStore,
        updatedAt: new Date(),
      })
      .where(eq(airline.id, airlineRow.id));

    // Delete old file if it exists
    if (oldKey) {
      try {
        await storage.delete(oldKey);
      } catch {
        // Silently fail, old logo cleanup is not critical
      }
    }
  });

  return urlToStore;
}
