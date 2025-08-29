import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { airline } from '@/db/schema';
import { getStorage } from '@/lib/storage';

import { removeCustomTheme } from './themes';

interface RemoveThemeData {
  url: string;
}

function urlToKey(url: string): string {
  // Stored URLs are like "/themes/xxx.css"; storage keys are without leading slash
  return url.replace(/^\/+/, '');
}

export async function removeTheme({ url }: RemoveThemeData): Promise<void> {
  // Only allow removing uploaded custom themes under /themes/
  if (!/^\/(themes\/).+\.css$/i.test(url)) {
    throw new Error('Can only remove custom uploaded themes');
  }

  const storage = getStorage();
  const key = urlToKey(url);

  // Delete the file (ignore ENOENT handled by storage layer)
  try {
    await storage.delete(key);
  } catch {
    // Non-fatal; continue to remove from manifest
  }

  // Remove from manifest
  await removeCustomTheme(url);

  // If currently selected theme equals this URL, reset to default
  const row = await db.select().from(airline).limit(1);
  const current = row[0];
  if (current && current.theme === url) {
    await db
      .update(airline)
      .set({ theme: 'default', updatedAt: new Date() })
      .where(eq(airline.id, current.id));
  }
}
