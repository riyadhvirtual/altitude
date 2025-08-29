'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { getThemesAction } from '@/actions/airline/get-themes';
import { removeThemeAction } from '@/actions/airline/remove-theme';
import { updateAirlineAction } from '@/actions/airline/update-airline';
import { uploadThemeAction } from '@/actions/airline/upload-theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import type { Airline } from '@/db/schema';
import { extractErrorMessage } from '@/lib/error-handler';

import { type FormValues, type Preview, schema, themes } from './constants';
import { CustomThemeCard } from './custom-theme-card';
import { parseCssVars, resolveHref } from './helpers';
import { RemoveThemeDialog } from './remove-theme-dialog';
import { ThemeCard } from './theme-card';
import { ThemeTemplateDialog } from './theme-template-dialog';

interface ThemeFormProps {
  airline: Airline;
}

export function ThemeForm({ airline }: ThemeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: airline.id,
      name: airline.name,
      callsign: airline.callsign,
      theme: (airline.theme as FormValues['theme']) || 'default',
      callsignMinRange: airline.callsignMinRange || 1,
      callsignMaxRange: airline.callsignMaxRange || 999,
    },
  });

  const {
    execute,
    isExecuting,
    result: themeResult,
    status: themeStatus,
  } = useAction(updateAirlineAction);

  const themeSubmittedRef = useRef(false);
  const themeLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (themeResult === themeLastResultRef.current) {
      return;
    }
    themeLastResultRef.current = themeResult as object | null;
    if (!themeSubmittedRef.current) {
      return;
    }

    const res = themeResult as
      | { data?: unknown; serverError?: unknown; validationErrors?: unknown }
      | undefined;

    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      res.data !== undefined
    ) {
      toast.success('Theme updated successfully!');
      const newTheme = form.getValues('theme');
      const link = document.querySelector(
        'link[data-airline-theme]'
      ) as HTMLLinkElement | null;
      if (newTheme && newTheme !== 'default') {
        const href = resolveHref(newTheme);
        if (link) {
          link.href = href;
          link.setAttribute('data-airline-theme', newTheme);
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = href;
          newLink.setAttribute('data-airline-theme', newTheme);
          document.head.appendChild(newLink);
        }
      } else if (link) {
        link.remove();
      }
      themeSubmittedRef.current = false;
      return;
    }

    if (
      themeStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Theme update failed');
      toast.error(msg);
      themeSubmittedRef.current = false;
    }
  }, [themeResult, themeStatus, form]);

  const onSubmit = (values: FormValues) => {
    execute({
      ...values,
      pirepsWebhookUrl: airline.pirepsWebhookUrl || '',
      newApplicationsWebhookUrl: airline.newApplicationsWebhookUrl || '',
      rankUpWebhookUrl: airline.rankUpWebhookUrl || '',
      leaveRequestWebhookUrl: airline.leaveRequestWebhookUrl || '',
      inactivityWebhookUrl: airline.inactivityWebhookUrl || '',
    });
  };

  const selectedTheme = form.watch('theme');

  const [customThemes, setCustomThemes] = useState<
    { name: string; url: string }[]
  >([]);

  const { execute: getThemes } = useAction(getThemesAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        setCustomThemes(data.themes || []);
      }
    },
  });

  useEffect(() => {
    getThemes();
  }, [getThemes]);

  const [customPreviews, setCustomPreviews] = useState<Record<string, Preview>>(
    {}
  );

  useEffect(() => {
    if (!customThemes.length) {
      return;
    }
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        customThemes.map(async (t) => {
          try {
            const res = await fetch(resolveHref(t.url), { cache: 'no-cache' });
            const css = await res.text();
            const vars = parseCssVars(css);
            const preview: Preview = {
              primary: vars['primary'] || '#000',
              secondary: vars['secondary'] || '#eee',
              accent: vars['accent'] || '#ddd',
              panel: vars['panel-background'] || vars['card'] || '#f7f7f8',
            };
            return [t.url, preview] as const;
          } catch {
            return [
              t.url,
              {
                primary: '#000',
                secondary: '#eee',
                accent: '#ddd',
                panel: '#f7f7f8',
              },
            ] as const;
          }
        })
      );
      if (!cancelled) {
        setCustomPreviews(Object.fromEntries(entries));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [customThemes]);

  const {
    execute: uploadTheme,
    isExecuting: isUploading,
    result: uploadThemeResult,
    status: uploadThemeStatus,
  } = useAction(uploadThemeAction);

  const uploadThemeSubmittedRef = useRef(false);
  const uploadThemeLastResultRef = useRef<object | null>(null);
  useEffect(() => {
    if (uploadThemeResult === uploadThemeLastResultRef.current) {
      return;
    }
    uploadThemeLastResultRef.current = uploadThemeResult as object | null;
    if (!uploadThemeSubmittedRef.current) {
      return;
    }
    const res = uploadThemeResult as
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
        toast.success('Theme uploaded');
        getThemes();
        uploadThemeSubmittedRef.current = false;
        return;
      }
    }
    if (
      uploadThemeStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Upload failed');
      toast.error(msg);
      uploadThemeSubmittedRef.current = false;
    }
  }, [uploadThemeResult, uploadThemeStatus, getThemes]);

  const onThemeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    uploadThemeSubmittedRef.current = true;
    await uploadTheme({ file });
  };

  // Remove theme flow
  const [deleteMode, setDeleteMode] = useState(false);
  const {
    execute: removeTheme,
    result: removeThemeResult,
    status: removeThemeStatus,
    isExecuting: isRemoving,
  } = useAction(removeThemeAction);
  const removeSubmittedRef = useRef(false);
  const removeLastResultRef = useRef<object | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<{
    name: string;
    url: string;
  } | null>(null);
  useEffect(() => {
    if (removeThemeResult === removeLastResultRef.current) {
      return;
    }
    removeLastResultRef.current = removeThemeResult as object | null;
    if (!removeSubmittedRef.current) {
      return;
    }
    const res = removeThemeResult as
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
      (res.data as { success?: boolean } | undefined)?.success
    ) {
      toast.success('Theme removed');
      getThemes();
      removeSubmittedRef.current = false;
      setDeleteMode(false);
      setConfirmOpen(false);
      setPendingTheme(null);
      return;
    }
    if (
      removeThemeStatus === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Remove failed');
      toast.error(msg);
      removeSubmittedRef.current = false;
    }
  }, [removeThemeResult, removeThemeStatus, getThemes]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Label className="text-base font-medium">Select Theme</Label>
          <ThemeTemplateDialog />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.value}
              selected={selectedTheme === theme.value}
              label={theme.label}
              colors={theme.colors}
              onSelect={() =>
                form.setValue('theme', theme.value as FormValues['theme'])
              }
            />
          ))}

          {customThemes.length > 0 &&
            customThemes.map((t) => (
              <CustomThemeCard
                key={t.url}
                selected={selectedTheme === t.url}
                name={t.name}
                preview={customPreviews[t.url]}
                deleteMode={deleteMode}
                onRemove={() => {
                  setPendingTheme({ name: t.name, url: t.url });
                  setConfirmOpen(true);
                }}
                onSelect={() =>
                  form.setValue('theme', t.url as FormValues['theme'])
                }
              />
            ))}
        </div>

        {form.formState.errors.theme && (
          <p className="text-sm text-red-500">
            {form.formState.errors.theme.message}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="theme-file">Upload CSS</Label>
          <Input
            id="theme-file"
            type="file"
            accept=".css,text/css"
            onChange={onThemeFileChange}
            disabled={isUploading}
          />
          <p className="text-xs text-muted-foreground">
            After upload, your theme appears below and can be selected.
          </p>
          {customThemes.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDeleteMode((v) => !v)}
                className={
                  deleteMode
                    ? 'text-xs underline text-destructive'
                    : 'text-xs underline text-muted-foreground hover:text-foreground'
                }
              >
                {deleteMode ? 'Cancel remove mode' : 'Remove a custom theme'}
              </button>
            </div>
          )}
        </div>
      </div>

      <ResponsiveDialogFooter
        primaryButton={{
          label: 'Apply Theme',
          disabled: isExecuting,
          loading: isExecuting,
          loadingLabel: 'Applying Theme...',
          type: 'submit',
        }}
      />
      <RemoveThemeDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) {
            setPendingTheme(null);
          }
        }}
        themeName={pendingTheme?.name || ''}
        loading={isRemoving}
        onConfirm={() => {
          if (!pendingTheme) {
            return;
          }
          removeSubmittedRef.current = true;
          if (
            form.getValues('theme') ===
            (pendingTheme.url as FormValues['theme'])
          ) {
            form.setValue('theme', 'default');
          }
          removeTheme({ url: pendingTheme.url });
        }}
      />
    </form>
  );
}
