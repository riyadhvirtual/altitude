'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef } from 'react';
import { type Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateSmtpSettingsAction } from '@/actions/airline/update-smtp-settings';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Airline } from '@/db/schema';
import { extractErrorMessage } from '@/lib/error-handler';

const fullSchema = z.object({
  id: z.string(),
  smtpHost: z.string().min(1, 'SMTP Host is required').max(255),
  smtpPort: z.number().min(1, 'Port must be at least 1').max(65535),
  smtpUsername: z.string().min(1, 'Username is required').max(255),
  smtpPassword: z.string().max(255).optional(),
  smtpFromEmail: z
    .string()
    .trim()
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email address')),
  smtpFromName: z.string().min(1, 'From name is required').max(255),
  smtpSecure: z.boolean(),
});

const subdomainSchema = fullSchema.pick({ id: true, smtpFromName: true });

type FormValues = z.infer<typeof fullSchema>;

interface SmtpFormProps {
  airline: Airline;
  tenantUsesAltitudeSubdomain: boolean;
}

export function SmtpForm({
  airline,
  tenantUsesAltitudeSubdomain,
}: SmtpFormProps) {
  const schema = tenantUsesAltitudeSubdomain ? subdomainSchema : fullSchema;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      id: airline.id,
      smtpHost: airline.smtpHost || '',
      smtpPort: airline.smtpPort || 465,
      smtpUsername: airline.smtpUsername || '',
      smtpPassword: '',
      smtpFromEmail: airline.smtpFromEmail || '',
      smtpFromName: airline.smtpFromName || airline.name || '',
      smtpSecure: airline.smtpSecure ?? true,
    },
  });

  const { execute, isExecuting, result, status } = useAction(
    updateSmtpSettingsAction
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
      toast.success('SMTP settings updated');
      form.setValue('smtpPassword', '');
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
    submittedRef.current = true;
    if (tenantUsesAltitudeSubdomain) {
      execute({
        id: values.id,
        smtpFromName: values.smtpFromName,
      } as Parameters<typeof execute>[0]);
      return;
    }

    const passwordToSend =
      values.smtpPassword && values.smtpPassword.trim() !== ''
        ? values.smtpPassword
        : undefined;

    execute({
      ...values,
      smtpPassword: passwordToSend,
    } as Parameters<typeof execute>[0]);
  };

  const hasSmtpConfig =
    airline.smtpHost &&
    airline.smtpPort &&
    airline.smtpUsername &&
    airline.smtpPassword;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {tenantUsesAltitudeSubdomain && (
        <div className="bg-card border-0 rounded-lg px-4 py-3 text-sm">
          <p>
            Your SMTP settings are managed by Altitude Cloud because you&apos;re
            using an altitude domain. To configure your own SMTP server,
            you&apos;ll need to use your own custom domain instead.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtp-host">SMTP Host</Label>
          <Input
            id="smtp-host"
            {...form.register('smtpHost')}
            disabled={isExecuting || tenantUsesAltitudeSubdomain}
            placeholder="smtp.gmail.com"
            className="h-11"
          />
          {form.formState.errors.smtpHost && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpHost.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtp-port">SMTP Port</Label>
          <Input
            id="smtp-port"
            type="number"
            {...form.register('smtpPort', { valueAsNumber: true })}
            disabled={isExecuting || tenantUsesAltitudeSubdomain}
            placeholder="465"
            min="1"
            max="65535"
            className="h-11"
          />
          {form.formState.errors.smtpPort && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpPort.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtp-username">Username</Label>
          <Input
            id="smtp-username"
            {...form.register('smtpUsername')}
            disabled={isExecuting || tenantUsesAltitudeSubdomain}
            placeholder="your-email@gmail.com"
            className="h-11"
          />
          {form.formState.errors.smtpUsername && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpUsername.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtp-password">Password</Label>
          <div className="relative">
            <Input
              id="smtp-password"
              type="password"
              {...form.register('smtpPassword')}
              disabled={isExecuting || tenantUsesAltitudeSubdomain}
              placeholder={
                hasSmtpConfig
                  ? '•••••••• (leave empty to keep current)'
                  : 'Enter password'
              }
              className="h-11 pr-10"
            />
          </div>
          {form.formState.errors.smtpPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpPassword.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtp-from-email">From Email</Label>
          <Input
            id="smtp-from-email"
            type="email"
            {...form.register('smtpFromEmail')}
            disabled={isExecuting || tenantUsesAltitudeSubdomain}
            placeholder="noreply@yourdomain.com"
            className="h-11"
          />
          {form.formState.errors.smtpFromEmail && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpFromEmail.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtp-from-name">From Name</Label>
          <Input
            id="smtp-from-name"
            {...form.register('smtpFromName')}
            disabled={isExecuting}
            placeholder="Air France Virtual"
            className="h-11"
          />
          {form.formState.errors.smtpFromName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.smtpFromName.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="smtp-secure"
          checked={form.watch('smtpSecure')}
          onCheckedChange={(checked) =>
            form.setValue('smtpSecure', checked as boolean)
          }
          disabled={isExecuting || tenantUsesAltitudeSubdomain}
        />
        <Label htmlFor="smtp-secure" className="text-sm font-normal">
          Use SSL/TLS (recommended for port 465, not needed for port 587)
        </Label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isExecuting} className="min-w-32">
          {isExecuting ? 'Saving...' : 'Save SMTP Settings'}
        </Button>
      </div>
    </form>
  );
}
