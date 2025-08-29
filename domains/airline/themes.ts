import { getStorage } from '@/lib/storage';

export interface CustomThemeEntry {
  name: string;
  url: string; // stored path or absolute URL
}

const MANIFEST_KEY = 'themes/manifest.json';

async function readManifest(): Promise<CustomThemeEntry[]> {
  const storage = getStorage();
  const exists = await storage.exists(MANIFEST_KEY);
  if (!exists) {
    return [];
  }
  try {
    const buf = await storage.getBuffer(MANIFEST_KEY);
    const parsed = JSON.parse(buf.toString('utf-8')) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (e): e is CustomThemeEntry =>
          !!e && typeof e === 'object' && 'name' in e && 'url' in e
      );
    }
  } catch {
    // ignore malformed manifest
  }
  return [];
}

async function writeManifest(entries: CustomThemeEntry[]): Promise<void> {
  const storage = getStorage();
  const json = JSON.stringify(entries, null, 2);
  await storage.put(Buffer.from(json), MANIFEST_KEY, 'application/json');
}

export async function listCustomThemes(): Promise<CustomThemeEntry[]> {
  return await readManifest();
}

export async function addCustomTheme(entry: CustomThemeEntry): Promise<void> {
  const list = await readManifest();
  const deduped = list.filter((e) => e.url !== entry.url);
  deduped.push(entry);
  await writeManifest(deduped);
}

export async function removeCustomTheme(url: string): Promise<void> {
  const list = await readManifest();
  const filtered = list.filter((e) => e.url !== url);
  await writeManifest(filtered);
}
