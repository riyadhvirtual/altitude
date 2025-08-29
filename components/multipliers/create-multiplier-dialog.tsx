'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createMultiplierAction } from '@/actions/multipliers/create-multiplier';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface CreateMultiplierDialogProps {
  children: React.ReactNode;
}

export default function CreateMultiplierDialog({
  children,
}: CreateMultiplierDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      value: 2.0,
    },
  });

  const { execute, isExecuting } = useAction(createMultiplierAction, {
    onSuccess: () => {
      toast.success('Multiplier added successfully');
      form.reset();
      setOpen(false);
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
    execute(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  const dialogStyles = getResponsiveDialogStyles(
    isMobile,
    'border border-border bg-card shadow-lg',
    'sm:max-w-[425px]',
    'fit'
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            {isMobile ? 'Add Multiplier' : 'Add New Multiplier'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            {isMobile
              ? 'Enter multiplier details'
              : 'Add a new multiplier. Enter the multiplier details below.'}
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
                        Adding...
                      </>
                    ) : (
                      'Add Multiplier'
                    )}
                  </Button>
                  <Button
                    className="border border-border bg-background text-foreground hover:bg-muted w-full"
                    disabled={isExecuting}
                    onClick={() => setOpen(false)}
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
                    onClick={() => setOpen(false)}
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
                        Adding...
                      </>
                    ) : (
                      'Add Multiplier'
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
