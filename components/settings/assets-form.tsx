'use client';

import { Globe, HelpCircle, Loader2, Moon, Sun, Upload } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { uploadAssetsAction } from '@/actions/airline/upload-assets';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type Airline } from '@/db/schema';
import { IMAGE_MAX_MB } from '@/lib/constants';
import { extractErrorMessage } from '@/lib/error-handler';
import { fileUrl } from '@/lib/urls';

interface AssetsFormProps {
  airline: Airline;
}

export function AssetsForm({ airline }: AssetsFormProps) {
  const [lightPreview, setLightPreview] = useState<string | null>(
    airline.lightLogoUrl ? fileUrl(airline.lightLogoUrl) : null
  );
  const [darkPreview, setDarkPreview] = useState<string | null>(
    airline.darkLogoUrl ? fileUrl(airline.darkLogoUrl) : null
  );
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    airline.faviconUrl ? fileUrl(airline.faviconUrl) : null
  );

  const lightRef = useRef<HTMLInputElement>(null);
  const darkRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const [dragOverLight, setDragOverLight] = useState(false);
  const [dragOverDark, setDragOverDark] = useState(false);
  const [dragOverFavicon, setDragOverFavicon] = useState(false);

  const {
    execute: uploadLight,
    isExecuting: uploadingLight,
    result: lightResult,
    status: lightStatus,
  } = useAction(uploadAssetsAction);
  const lightSubmittedRef = useRef(false);
  const lightLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (lightResult === lightLastResultRef.current) {
      return;
    }
    lightLastResultRef.current = lightResult as object | null;
    if (!lightSubmittedRef.current) {
      return;
    }
    const res = lightResult as
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
        toast.success('Light logo updated');
        if (data.url) {
          setLightPreview(fileUrl(data.url));
        }
        lightSubmittedRef.current = false;
        return;
      }
    }
    if (
      lightStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Upload failed');
      toast.error(msg);
      lightSubmittedRef.current = false;
    }
  }, [lightResult, lightStatus]);

  const {
    execute: uploadDark,
    isExecuting: uploadingDark,
    result: darkResult,
    status: darkStatus,
  } = useAction(uploadAssetsAction);
  const darkSubmittedRef = useRef(false);
  const darkLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (darkResult === darkLastResultRef.current) {
      return;
    }
    darkLastResultRef.current = darkResult as object | null;
    if (!darkSubmittedRef.current) {
      return;
    }
    const res = darkResult as
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
        toast.success('Dark logo updated');
        if (data.url) {
          setDarkPreview(fileUrl(data.url));
        }
        darkSubmittedRef.current = false;
        return;
      }
    }
    if (
      darkStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Upload failed');
      toast.error(msg);
      darkSubmittedRef.current = false;
    }
  }, [darkResult, darkStatus]);

  const {
    execute: uploadFavicon,
    isExecuting: uploadingFavicon,
    result: favResult,
    status: favStatus,
  } = useAction(uploadAssetsAction);
  const favSubmittedRef = useRef(false);
  const favLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (favResult === favLastResultRef.current) {
      return;
    }
    favLastResultRef.current = favResult as object | null;
    if (!favSubmittedRef.current) {
      return;
    }
    const res = favResult as
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
        toast.success('Favicon updated');
        if (data.url) {
          setFaviconPreview(fileUrl(data.url));
        }
        favSubmittedRef.current = false;
        return;
      }
    }
    if (
      favStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Upload failed');
      toast.error(msg);
      favSubmittedRef.current = false;
    }
  }, [favResult, favStatus]);

  const handleValidatedUpload = (
    file: File,
    type: 'light' | 'dark' | 'favicon',
    setPreview: (url: string) => void
  ) => {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
    ];
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

    if (type === 'light') {
      lightSubmittedRef.current = true;
      uploadLight({ logoType: type, file });
    } else if (type === 'dark') {
      darkSubmittedRef.current = true;
      uploadDark({ logoType: type, file });
    } else {
      favSubmittedRef.current = true;
      uploadFavicon({ logoType: type, file });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'light' | 'dark' | 'favicon',
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    handleValidatedUpload(file, type, setPreview);
  };

  const trigger = (ref: React.RefObject<HTMLInputElement | null>) =>
    ref.current?.click();

  const LogoSlot = ({
    type,
    preview,
    ref,
    uploading,
    dragOver,
    setDragOver,
  }: {
    type: 'light' | 'dark' | 'favicon';
    preview: string | null;
    ref: React.RefObject<HTMLInputElement | null>;
    uploading: boolean;
    dragOver: boolean;
    setDragOver: (v: boolean) => void;
  }) => (
    <div className="rounded-md bg-card p-4">
      <div className="flex items-center gap-2">
        {type === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : type === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Globe className="h-4 w-4" />
        )}
        <span className="text-base font-medium">
          {type === 'light'
            ? 'Light Theme Logo'
            : type === 'dark'
              ? 'Dark Theme Logo'
              : 'Favicon'}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {type === 'favicon'
                ? 'Shown in the browser tab.'
                : `Displayed when users are on the ${type} theme.`}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {type === 'favicon' ? '' : ''}
      </p>

      <div
        className={[
          'relative group cursor-pointer rounded-md p-6 transition-colors mt-3 flex items-center justify-center',
          dragOver ? 'bg-accent/20' : 'bg-accent/10',
          type === 'favicon' ? 'h-[140px]' : 'h-[180px]',
        ].join(' ')}
        onClick={() => trigger(ref)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (!file) {
            return;
          }
          handleValidatedUpload(
            file,
            type,
            type === 'light'
              ? setLightPreview
              : type === 'dark'
                ? setDarkPreview
                : setFaviconPreview
          );
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            trigger(ref);
          }
        }}
        aria-label={`Upload ${type}`}
      >
        {preview ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={preview}
              alt={`${type} preview`}
              className={
                type === 'favicon'
                  ? 'h-16 w-16 object-contain'
                  : 'max-h-28 max-w-full object-contain'
              }
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground">
            <Upload className="h-8 w-8 mb-2" />
            <span>
              Click or drag a file to upload{' '}
              {type === 'favicon' ? 'favicon' : `${type} logo`}
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-[color:var(--overlay)] flex items-center justify-center rounded-md">
            <span className="text-xs font-medium flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => trigger(ref)}>
          Upload
        </Button>
        {preview && (
          <a href={preview} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm">
              View
            </Button>
          </a>
        )}
      </div>

      <input
        type="file"
        accept={
          type === 'favicon'
            ? 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon'
            : 'image/png,image/jpeg,image/webp,image/svg+xml'
        }
        ref={ref}
        className="hidden"
        onChange={(e) =>
          handleInputChange(
            e,
            type,
            type === 'light'
              ? setLightPreview
              : type === 'dark'
                ? setDarkPreview
                : setFaviconPreview
          )
        }
      />
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LogoSlot
            type="light"
            preview={lightPreview}
            ref={lightRef}
            uploading={uploadingLight}
            dragOver={dragOverLight}
            setDragOver={setDragOverLight}
          />
          <LogoSlot
            type="dark"
            preview={darkPreview}
            ref={darkRef}
            uploading={uploadingDark}
            dragOver={dragOverDark}
            setDragOver={setDragOverDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LogoSlot
            type="favicon"
            preview={faviconPreview}
            ref={faviconRef}
            uploading={uploadingFavicon}
            dragOver={dragOverFavicon}
            setDragOver={setDragOverFavicon}
          />
          <div className="rounded-md bg-card p-4">
            <div className="mb-2">
              <span className="text-base font-medium">Preview</span>
              <p className="text-sm text-muted-foreground">
                How your assets may appear in the UI
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Navbar preview</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div
                    className="rounded-md"
                    style={{
                      backgroundColor: 'var(--panel-background)',
                      color: 'var(--panel-foreground)',
                    }}
                  >
                    <div className="h-12 flex items-center px-4 gap-3">
                      {lightPreview ? (
                        <img
                          src={lightPreview}
                          alt="Light logo preview"
                          className="h-7 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-7 w-20 bg-muted rounded-md" />
                      )}
                      <div className="flex-1" />
                      <div className="h-6 w-28 bg-muted rounded-md" />
                      <div className="h-6 w-12 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div
                    className="rounded-md"
                    style={{
                      backgroundColor: 'var(--panel-background)',
                      color: 'var(--panel-foreground)',
                    }}
                  >
                    <div className="h-12 flex items-center px-4 gap-3">
                      {darkPreview ? (
                        <img
                          src={darkPreview}
                          alt="Dark logo preview"
                          className="h-7 w-auto object-contain"
                        />
                      ) : (
                        <div className="h-7 w-20 bg-muted rounded-md" />
                      )}
                      <div className="flex-1" />
                      <div className="h-6 w-28 bg-muted rounded-md" />
                      <div className="h-6 w-12 bg-muted rounded-md" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Favicon preview</Label>
                <div className="flex items-center gap-6">
                  {[16, 32, 48].map((size) => (
                    <div
                      key={size}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className="rounded-md p-2"
                        style={{ backgroundColor: 'var(--card)' }}
                      >
                        {faviconPreview ? (
                          <img
                            src={faviconPreview}
                            alt={`${size}×${size} favicon`}
                            width={size}
                            height={size}
                            className="object-contain"
                          />
                        ) : (
                          <div
                            style={{ width: size, height: size }}
                            className="bg-muted rounded"
                          />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {size}×{size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
