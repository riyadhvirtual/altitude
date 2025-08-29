'use client';

import { useCallback, useMemo, useState } from 'react';

import { IMAGE_MAX_MB } from '@/lib/constants';

export interface ImageMeta {
  w: number;
  h: number;
}

export function useImagePreview(maxSizeMb: number = IMAGE_MAX_MB) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);

  const sizeLabel = useMemo(() => {
    if (!file) {
      return undefined;
    }
    return `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const remove = useCallback(() => {
    setFile(null);
    setPreview(null);
    setMeta(null);
  }, []);

  const setFromUrl = useCallback((url: string) => {
    setFile(null);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      setMeta({ w: img.width, h: img.height });
    };
    img.src = url;
  }, []);

  const pick = useCallback(
    (f: File): { ok: boolean; error?: string } => {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) {
        return {
          ok: false,
          error: 'Unsupported file type (use JPG, PNG, or WebP).',
        };
      }
      if (f.size > maxSizeMb * 1024 * 1024) {
        return { ok: false, error: `File too large (max ${maxSizeMb} MB).` };
      }

      setFile(f);
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        setPreview(src);
        const img = new Image();
        img.onload = () => {
          setMeta({ w: img.width, h: img.height });
        };
        img.src = src;
      };
      reader.readAsDataURL(f);
      return { ok: true };
    },
    [maxSizeMb]
  );

  return { file, preview, meta, sizeLabel, pick, remove, setFromUrl };
}

export default useImagePreview;
