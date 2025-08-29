'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateInfiniteFlightApiAction } from '@/actions/airline/update-infinite-flight-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Airline } from '@/db/schema';
import { extractErrorMessage } from '@/lib/error-handler';

const schema = z.object({
  id: z.string(),
  infiniteFlightApiKey: z.string().max(255).optional(),
});

type FormValues = z.infer<typeof schema>;

interface InfiniteFlightFormProps {
  airline: Airline;
}

export function InfiniteFlightForm({ airline }: InfiniteFlightFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: airline.id,
      infiniteFlightApiKey: '',
    },
  });

  const { execute, isExecuting, result, status } = useAction(
    updateInfiniteFlightApiAction
  );

  const submittedRef = useRef(false);
  const lastResultRef = useRef<object | null>(null);

  useEffect(() => {
    if (result === lastResultRef.current) {
      return;
    }
    lastResultRef.current = result as object | null;
    if (!submittedRef.current) {
      return;
    }

    const res = result as
      | { data?: unknown; serverError?: unknown; validationErrors?: unknown }
      | undefined;

    if (
      res &&
      typeof res === 'object' &&
      'data' in res &&
      res.data !== undefined
    ) {
      toast.success('Infinite Flight API settings updated');
      form.setValue('infiniteFlightApiKey', '');
      submittedRef.current = false;
      return;
    }

    if (
      status === 'hasErrored' ||
      (res &&
        typeof res === 'object' &&
        (('serverError' in res && res.serverError !== undefined) ||
          ('validationErrors' in res && res.validationErrors !== undefined)))
    ) {
      const msg = extractErrorMessage(res, 'Update failed');
      toast.error(msg);
      submittedRef.current = false;
    }
  }, [result, status, form]);

  const onSubmit = (values: FormValues) => {
    const apiKeyToSend =
      values.infiniteFlightApiKey && values.infiniteFlightApiKey.trim() !== ''
        ? values.infiniteFlightApiKey
        : undefined;

    submittedRef.current = true;
    execute({
      ...values,
      infiniteFlightApiKey: apiKeyToSend,
    });
  };

  const hasApiKey = airline.infiniteFlightApiKey;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="infiniteFlightApiKey">API Key</Label>
            {hasApiKey && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Configured
                </span>
              </div>
            )}
          </div>
          <Input
            id="infiniteFlightApiKey"
            type="password"
            placeholder={
              hasApiKey
                ? '••••••••••••••••••••••••••••••••'
                : 'Enter your Infinite Flight API key'
            }
            {...form.register('infiniteFlightApiKey')}
            className="font-mono"
          />
          {form.formState.errors.infiniteFlightApiKey && (
            <p className="text-sm text-destructive">
              {form.formState.errors.infiniteFlightApiKey.message}
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Note:</strong> Your API key is encrypted and stored
            securely.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isExecuting}>
          {isExecuting ? 'Updating...' : 'Update API Settings'}
        </Button>
      </div>
    </form>
  );
}
