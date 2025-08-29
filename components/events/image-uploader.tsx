'use client';

import { Upload, X } from 'lucide-react';
import { memo, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { IMAGE_MAX_MB } from '@/lib/constants';

interface ImageUploaderProps {
  preview: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  meta?: { w: number; h: number } | null;
  sizeLabel?: string;
}

export function ImageUploader({
  preview,
  onPick,
  onRemove,
  meta,
  sizeLabel,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex items-center gap-4 rounded-md p-4 transition bg-background"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      aria-label="Upload event image"
    >
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Event preview"
            className="h-20 w-20 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="h-20 w-20 rounded-md flex items-center justify-center bg-muted/10">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Image
          </Button>
          {preview && (
            <Button type="button" variant="ghost" onClick={onRemove}>
              Replace
            </Button>
          )}
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onPick(f);
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP ≤ {IMAGE_MAX_MB} MB
          {sizeLabel && ` · ${sizeLabel}`}
          {meta && ` · ${meta.w}×${meta.h}px`}
        </p>
      </div>
    </div>
  );
}

export default memo(ImageUploader);
