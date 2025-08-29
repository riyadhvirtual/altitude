'use client';

import { Loader2, Upload } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { removeAuthBrandingAction } from '@/actions/airline/remove-auth-image';
import { uploadAuthBrandingAction } from '@/actions/airline/upload-auth-image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IMAGE_MAX_MB } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/error-handler';
import { fileUrl } from '@/lib/urls';

interface AuthBrandingFormProps {
  existingUrl?: string | null;
}

export function AuthBrandingForm({ existingUrl }: AuthBrandingFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    execute: uploadImage,
    isExecuting: uploading,
    result: uploadResult,
    status: uploadStatus,
  } = useAction(uploadAuthBrandingAction);
  const uploadSubmittedRef = useRef(false);
  const uploadLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (uploadResult === uploadLastResultRef.current) {
      return;
    }
    uploadLastResultRef.current = uploadResult as object | null;
    if (!uploadSubmittedRef.current) {
      return;
    }
    const res = uploadResult as
      | {
          data?: { success?: boolean; url?: string } | unknown;
          serverError?: unknown;
          validationErrors?: unknown;
        }
      | undefined;
    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      (res.data as { success?: boolean } | undefined)
    ) {
      const data = res.data as { success?: boolean; url?: string } | undefined;
      if (data?.success) {
        toast.success('Auth background updated');
        if (data.url) {
          setPreview(fileUrl(data.url));
        }
        uploadSubmittedRef.current = false;
        return;
      }
    }
    if (
      uploadStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Upload failed');
      toast.error(msg);
      uploadSubmittedRef.current = false;
    }
  }, [uploadResult, uploadStatus]);

  const {
    execute: removeImage,
    isExecuting: removing,
    result: removeResult,
    status: removeStatus,
  } = useAction(removeAuthBrandingAction);
  const removeSubmittedRef = useRef(false);
  const removeLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (removeResult === removeLastResultRef.current) {
      return;
    }
    removeLastResultRef.current = removeResult as object | null;
    if (!removeSubmittedRef.current) {
      return;
    }
    const res = removeResult as
      | {
          data?: { success?: boolean } | unknown;
          serverError?: unknown;
          validationErrors?: unknown;
        }
      | undefined;
    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      (res.data as { success?: boolean } | undefined)
    ) {
      const data = res.data as { success?: boolean } | undefined;
      if (data?.success) {
        toast.success('Auth background removed');
        setPreview(null);
        removeSubmittedRef.current = false;
        return;
      }
    }
    if (
      removeStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Remove failed');
      toast.error(msg);
      removeSubmittedRef.current = false;
    }
  }, [removeResult, removeStatus]);

  useEffect(() => {
    if (existingUrl) {
      setPreview(existingUrl);
    }
  }, [existingUrl]);

  const handleValidatedUpload = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Unsupported file type');
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      toast.error(`File too large (max ${IMAGE_MAX_MB} MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    uploadSubmittedRef.current = true;
    uploadImage({ file });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    handleValidatedUpload(file);
  };

  const trigger = () => inputRef.current?.click();

  const Slot = () => (
    <div className="p-0">
      <div
        className="relative group cursor-pointer rounded-md p-0 transition-colors mt-2 w-full aspect-[16/9] overflow-hidden bg-card"
        onClick={trigger}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger();
          }
        }}
        aria-label="Upload auth background"
      >
        {preview ? (
          <img
            src={preview}
            alt="Auth background preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-sm text-muted-foreground">
            <Upload className="h-8 w-8 mb-2" />
            <span>Click or drag a file to upload login page image</span>
            <span className="text-xs mt-1">
              JPG, PNG or WebP · up to {IMAGE_MAX_MB}MB
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-[color:var(--overlay)] flex items-center justify-center">
            <span className="text-xs font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={trigger}
          disabled={uploading || removing}
        >
          {preview ? 'Replace' : 'Upload'}
        </Button>
        {preview && (
          <>
            <a href={preview} target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading || removing}
              >
                View
              </Button>
            </a>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                removeSubmittedRef.current = true;
                removeImage();
              }}
              disabled={uploading || removing}
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Removing…
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </>
        )}
      </div>

      <input
        type="file"
        accept={'image/png,image/jpeg,image/webp'}
        ref={inputRef}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="rounded-md bg-card p-4">
        <Label className="text-sm">Guidelines</Label>
        <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Use wide images for best results (e.g. 1600×900+).</li>
          <li>Accepted formats: JPG, PNG, WebP. Max {IMAGE_MAX_MB}MB.</li>
        </ul>
      </div>
      <Slot />
    </div>
  );
}
