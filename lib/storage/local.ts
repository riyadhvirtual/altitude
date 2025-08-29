import { promises as fs } from 'fs';
import path from 'path';

import { IStorage, PutOptions, StoredFile } from './types';

export class LocalStorage implements IStorage {
  constructor(
    private rootDir: string,
    private publicUrl: string
  ) {}

  private fullPath(key: string): string {
    return path.join(this.rootDir, key);
  }

  async put(
    buffer: Buffer,
    key: string,
    mime: string,
    opts?: PutOptions
  ): Promise<StoredFile> {
    if (opts?.maxBytes && buffer.length > opts.maxBytes) {
      throw new Error('File too large');
    }
    if (opts?.allowedMime && !opts.allowedMime?.includes(mime)) {
      throw new Error('Mime type not allowed');
    }

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(this.fullPath(key)), { recursive: true });

      // Write file with proper permissions
      await fs.writeFile(this.fullPath(key), buffer, { mode: 0o644 });

      const stat = await fs.stat(this.fullPath(key));
      return {
        key,
        url: key, // Return just the key like S3 implementation
        size: stat.size,
        uploadedAt: stat.mtime, // Use mtime for consistency with S3
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      throw new Error(`Failed to write file: ${err.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.fullPath(key));
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== 'ENOENT') {
        throw new Error(`Failed to delete file: ${e.message}`);
      }
      // File doesn't exist, consider it successfully deleted
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(key));
      return true;
    } catch {
      return false;
    }
  }

  async stat(key: string): Promise<Omit<StoredFile, 'url'>> {
    try {
      const s = await fs.stat(this.fullPath(key));
      return {
        key,
        size: s.size,
        uploadedAt: s.mtime, // Use mtime for consistency with S3
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      throw new Error(`Failed to get file stats: ${err.message}`);
    }
  }

  async getBuffer(key: string): Promise<Buffer> {
    try {
      return await fs.readFile(this.fullPath(key));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      throw new Error(`Failed to read file: ${err.message}`);
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
