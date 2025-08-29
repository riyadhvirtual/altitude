'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updateBotSettingsAction } from '@/actions/airline/update-bot-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { extractErrorMessage } from '@/lib/error-handler';

const schema = z.object({
  botToken: z.string().optional(),
  clientId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DiscordFormProps {
  hasExistingToken?: boolean;
  hasExistingClientId?: boolean;
  existingBotToken?: string;
  existingClientId?: string;
}

export function DiscordForm({
  hasExistingToken = false,
  existingClientId = '',
  existingBotToken = '',
}: DiscordFormProps) {
  const [showToken, _setShowToken] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      botToken: existingBotToken,
      clientId: existingClientId,
    },
  });

  const { execute, isExecuting, result, status } = useAction(
    updateBotSettingsAction
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
      toast.success('Discord bot settings updated successfully');
      form.reset();
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
      const msg = extractErrorMessage(
        res,
        'Failed to update Discord bot settings'
      );
      toast.error(msg);
      submittedRef.current = false;
    }
  }, [result, status, form]);

  const onSubmit = (values: FormValues) => {
    const tokenToSend =
      values.botToken && values.botToken.trim() !== ''
        ? values.botToken
        : undefined;
    const clientIdToSend =
      values.clientId && values.clientId.trim() !== ''
        ? values.clientId
        : undefined;

    submittedRef.current = true;
    execute({
      ...values,
      botToken: tokenToSend,
      clientId: clientIdToSend,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Bot Credentials</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your Discord bot&apos;s authentication and identification.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientId" className="flex items-center gap-2">
            Client ID
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Your Discord bot&apos;s Client ID from the Discord Developer
                  Portal. This is used for deploying slash commands.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Input
            id="clientId"
            type="text"
            placeholder="Enter client ID"
            {...form.register('clientId')}
            className="h-11 font-mono text-sm"
          />
          {form.formState.errors.clientId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.clientId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="botToken" className="flex items-center gap-2">
              Bot Token
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your Discord bot token from the Discord Developer Portal.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            {hasExistingToken && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Configured
                </span>
              </div>
            )}
          </div>
          <Input
            id="botToken"
            type={showToken ? 'text' : 'password'}
            placeholder={
              hasExistingToken
                ? '••••••••••••••••••••••••••••••••'
                : 'Enter bot token'
            }
            {...form.register('botToken')}
            className="h-11 font-mono text-sm"
          />
          {form.formState.errors.botToken && (
            <p className="text-sm text-red-500">
              {form.formState.errors.botToken.message}
            </p>
          )}
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> Your bot token is encrypted and stored
              securely.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isExecuting} className="min-w-32">
          {isExecuting
            ? 'Saving...'
            : hasExistingToken
              ? 'Update Settings'
              : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
