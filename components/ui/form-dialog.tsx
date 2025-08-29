'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import {
  type DefaultValues,
  type Path,
  Resolver,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

export interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'number';
  step?: string;
}

type ActionResult = {
  data?: { success?: boolean; error?: string };
  error?: { serverError?: string };
};

interface FormDialogProps<TSchema extends z.ZodObject<z.ZodRawShape>> {
  children?: React.ReactNode;
  title: string;
  description: string;
  fields: FormFieldConfig[];
  schema: TSchema;
  /**
   * A "safe-action" produced function that will be executed with the
   * parsed form values. The generic parameter ensures that the input shape
   * matches the provided Zod schema while still keeping this component
   * completely generic
   */
  action: (data: z.infer<TSchema>) => Promise<unknown> | unknown;
  successMessage: string;
  submitLabel: string;
  defaultValues?: Partial<z.infer<TSchema>>;
  // External state management props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FormDialog<TSchema extends z.ZodObject<z.ZodRawShape>>({
  children,
  title,
  description,
  fields,
  schema,
  action,
  successMessage,
  submitLabel,
  defaultValues = {},
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: FormDialogProps<TSchema>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  // Use external state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Get responsive dialog styles
  const dialogStyles = getResponsiveDialogStyles(
    isMobile,
    'border border-border bg-card shadow-lg',
    'sm:max-w-[425px]',
    'sheet'
  );

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<TSchema>>,
    defaultValues: defaultValues as DefaultValues<z.infer<TSchema>>,
  });

  // The generic signature of `useAction` coming from `next-safe-action` is
  // highly specific to the server-side action that is passed in. Because this
  // component accepts any safe-action, it is not possible to keep full type
  // safety here without overly constraining the generic. We therefore
  // intentionally rely on a narrow cast and suppress the error so that the
  // rest of the component stays strictly typed
  // @ts-expect-error -- The concrete SafeAction type is provided by the caller.
  const { execute, isExecuting } = useAction(action, {
    onSuccess: ({ data }: ActionResult) => {
      if (data?.success) {
        setOpen(false);
        form.reset();
        router.refresh();
        toast.success(successMessage);
      } else {
        // Handle error response from action
        const errorMessage =
          data?.error || `Failed to ${submitLabel.toLowerCase()}`;
        toast.error(errorMessage);
      }
    },
    onError: (errorResponse: ActionResult) => {
      const errorMessage = extractActionErrorMessage(
        errorResponse as ActionErrorResponse,
        `Failed to ${submitLabel.toLowerCase()}`
      );
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: z.infer<TSchema>) => {
    execute(data as unknown as never);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className={cn(dialogStyles.className, 'max-w-[360px]')}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as Path<z.infer<TSchema>>}
                render={({ field: formField }) => {
                  const fieldState = form.getFieldState(
                    field.name as Path<z.infer<TSchema>>
                  );
                  return (
                    <FormItem className="w-full">
                      <FormLabel className="text-foreground">
                        {field.label}
                      </FormLabel>
                      <Input
                        id={`${field.name}-form-item`}
                        className="w-full"
                        placeholder={field.placeholder}
                        type={field.type || 'text'}
                        step={field.step}
                        {...(formField as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
                        disabled={isExecuting}
                        aria-invalid={!!fieldState.error}
                      />
                      <FormMessage className="text-destructive" />
                    </FormItem>
                  );
                }}
              />
            ))}

            <div
              className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end gap-3'} pt-4`}
            >
              {isMobile ? (
                <>
                  <Button
                    className={`min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 w-full`}
                    disabled={isExecuting}
                    type="submit"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {submitLabel.toLowerCase()}ing...
                      </>
                    ) : (
                      submitLabel
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
                        {submitLabel.toLowerCase()}ing...
                      </>
                    ) : (
                      submitLabel
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
