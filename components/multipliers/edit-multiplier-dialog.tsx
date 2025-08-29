'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { editMultiplierAction } from '@/actions/multipliers/edit-multiplier';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';
import { cn, getResponsiveDialogStyles } from '@/lib/utils';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Multiplier name is required')
    .max(100, 'Multiplier name must be less than 100 characters'),
  value: z.coerce.number().min(1.1, 'Multiplier value must be greater than 1'),
});

type FormData = z.infer<typeof formSchema>;

interface EditMultiplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multiplier: {
    id: string;
    name: string;
    value: number;
  };
}

export default function EditMultiplierDialog({
  open,
  onOpenChange,
  multiplier,
}: EditMultiplierDialogProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: multiplier.name,
      value: multiplier.value,
    },
  });

  // Update form when multiplier changes
  useEffect(() => {
    form.reset({
      name: multiplier.name,
      value: multiplier.value,
    });
  }, [multiplier, form]);

  const { execute, isExecuting } = useAction(editMultiplierAction, {
    onSuccess: () => {
      toast.success('Multiplier updated successfully');
      onOpenChange(false);
      router.refresh();
    },
    onError: ({ error }) => {
      const errorMessage = extractActionErrorMessage(
        error as ActionErrorResponse
      );
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    execute({ id: multiplier.id, ...data });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset({
        name: multiplier.name,
        value: multiplier.value,
      });
    }
    onOpenChange(newOpen);
  };

  const dialogStyles = getResponsiveDialogStyles(
    isMobile,
    'border border-border bg-card shadow-lg',
    'sm:max-w-[425px]',
    'fit'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(dialogStyles.className, 'max-w-[360px]')}
        style={dialogStyles.style}
        showCloseButton
        onInteractOutside={(e) => {
          if (isExecuting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {isMobile ? 'Edit Multiplier' : 'Edit Multiplier'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            {isMobile
              ? 'Update multiplier details'
              : 'Update the multiplier details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground">
                    {isMobile ? 'Name' : 'Multiplier Name'}
                  </FormLabel>
                  <Input
                    placeholder={
                      isMobile ? 'Multiplier name' : 'Saturday Event'
                    }
                    disabled={isExecuting}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground">
                    {isMobile ? 'Value' : 'Multiplier Value'}
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    disabled={isExecuting}
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <div
              className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end gap-3'} pt-4`}
            >
              {isMobile ? (
                <>
                  <Button
                    className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                    disabled={isExecuting}
                    type="submit"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    className="border border-border bg-background text-foreground hover:bg-muted w-full"
                    disabled={isExecuting}
                    onClick={() => onOpenChange(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="border border-border bg-background text-foreground hover:bg-muted"
                    disabled={isExecuting}
                    onClick={() => onOpenChange(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isExecuting}
                    type="submit"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
