export interface StoredFile {
  key: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface PutOptions {
  maxBytes?: number;
  allowedMime?: string[];
}

export interface IStorage {
  put(
    buffer: Buffer,
    key: string,
    mime: string,
    opts?: PutOptions
  ): Promise<StoredFile>;

  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  stat(key: string): Promise<Omit<StoredFile, 'url'>>;
  getBuffer(key: string): Promise<Buffer>;
  getPublicUrl(key: string): string;
}
