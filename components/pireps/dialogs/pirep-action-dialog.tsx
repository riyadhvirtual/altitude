'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { updatePirepStatusAction } from '@/actions/pireps/update-pirep-status';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { Textarea } from '@/components/ui/textarea';
import type { Pirep } from '@/db/schema';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

const denyFormSchema = z.object({
  deniedReason: z
    .string()
    .min(1, 'Denied reason is required')
    .max(200, 'Denied reason must be at most 200 characters'),
});

interface PirepActionDialogProps {
  pirep: Pirep | null;
  action: 'approved' | 'denied' | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PirepActionDialog({
  pirep,
  action,
  isOpen,
  onClose,
  onSuccess,
}: PirepActionDialogProps) {
  const { dialogStyles } = useResponsiveDialog();
  const form = useForm<z.infer<typeof denyFormSchema>>({
    resolver: zodResolver(denyFormSchema),
    defaultValues: { deniedReason: '' },
  });

  const { execute: updatePirepStatus, isExecuting } = useAction(
    updatePirepStatusAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || 'PIREP status updated successfully');
        onSuccess();
        onClose();
        form.reset();
      },
      onError: ({ error }) => {
        const deniedReasonError =
          error.validationErrors?.deniedReason?._errors?.[0];
        if (deniedReasonError) {
          toast.error(deniedReasonError);
          return;
        }
        toast.error(error.serverError || 'Failed to update PIREP status');
      },
    }
  );

  const onDenySubmit = (values: z.infer<typeof denyFormSchema>) => {
    if (!pirep || action !== 'denied') {
      return;
    }

    updatePirepStatus({
      id: pirep.id,
      status: action,
      deniedReason: values.deniedReason,
    });
  };

  const onApproveClick = () => {
    if (!pirep || action !== 'approved') {
      return;
    }
    updatePirepStatus({ id: pirep.id, status: action });
  };

  const deniedReasonValue = form.watch('deniedReason') || '';

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {action === 'approved' ? 'Approve' : 'Deny'} PIREP
          </DialogTitle>
          <DialogDescription className="pt-3 text-foreground">
            Are you sure you want to{' '}
            {action === 'approved' ? 'approve' : 'deny'} flight{' '}
            <span className="font-bold">{pirep?.flightNumber}</span>? This
            action can be changed later if needed.
          </DialogDescription>
        </DialogHeader>
        {action === 'denied' && (
          <>
            <Form {...form}>
              <form
                id="deny-pirep-form"
                onSubmit={form.handleSubmit(onDenySubmit)}
                className="mb-2"
              >
                <FormField
                  control={form.control}
                  name="deniedReason"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          Reason for denial{' '}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <span className="text-xs text-muted-foreground">
                          {deniedReasonValue.length} / 200
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Enter reason for denial (required)"
                          className="w-full"
                          rows={2}
                          disabled={isExecuting}
                          required
                          maxLength={200}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <ResponsiveDialogFooter
              primaryButton={{
                label: isExecuting ? 'Processing...' : 'Deny',
                onClick: () => form.handleSubmit(onDenySubmit)(),
                disabled: isExecuting,
                loading: isExecuting,
                loadingLabel: 'Processing...',
                className:
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              }}
              secondaryButton={{
                label: 'Cancel',
                onClick: onClose,
                disabled: isExecuting,
              }}
            />
          </>
        )}
        {action === 'approved' && (
          <ResponsiveDialogFooter
            primaryButton={{
              label: isExecuting ? 'Processing...' : 'Approve',
              onClick: onApproveClick,
              disabled: isExecuting,
              loading: isExecuting,
              loadingLabel: 'Processing...',
              className: 'bg-green-600 text-white hover:bg-green-700',
            }}
            secondaryButton={{
              label: 'Cancel',
              onClick: onClose,
              disabled: isExecuting,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
