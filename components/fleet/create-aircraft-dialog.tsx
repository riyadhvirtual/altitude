'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createAircraftAction } from '@/actions/aircraft/create-aircraft';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
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
import { useAircraftData } from '@/hooks/use-aircraft-data';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ActionErrorResponse,
  extractActionErrorMessage,
} from '@/lib/error-handler';
import { cn, getResponsiveDialogStyles } from '@/lib/utils';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Aircraft name is required')
    .max(100, 'Aircraft name must be less than 100 characters'),
  livery: z
    .string()
    .min(1, 'Livery is required')
    .max(100, 'Livery must be less than 100 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAircraftDialogProps {
  children: React.ReactNode;
}

export default function CreateAircraftDialog({
  children,
}: CreateAircraftDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { aircraft, loading: aircraftLoading } = useAircraftData();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      livery: '',
    },
  });

  const { execute, isExecuting } = useAction(createAircraftAction, {
    onSuccess: () => {
      toast.success('Aircraft added successfully');
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

  const selectedAircraftName = form.watch('name');

  // Get aircraft names and liveries for the selected aircraft
  const aircraftNames = useMemo(
    () => [...new Set(aircraft.map((a) => a.name))].sort(),
    [aircraft]
  );

  const availableLiveries = useMemo(() => {
    const selectedAircraft = aircraft.find(
      (a) => a.name === selectedAircraftName
    );
    return selectedAircraft
      ? [
          ...new Set(selectedAircraft.liveries.map((livery) => livery.name)),
        ].sort()
      : [];
  }, [aircraft, selectedAircraftName]);

  const onSubmit = (data: FormData) => {
    // Find the selected aircraft to get the aircraftID
    const selectedAircraft = aircraft.find((a) => a.name === data.name);

    if (selectedAircraft) {
      // Use the Infinite Flight aircraftID instead of creating a new one
      execute({
        ...data,
        aircraftID: selectedAircraft.aircraftID,
      });
    } else {
      // Fallback to original behavior for custom aircraft
      execute(data);
    }
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
            Add New Aircraft
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            Add a new aircraft to your fleet. Select from available aircraft or
            enter custom details.
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
                    Aircraft Name
                  </FormLabel>
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={aircraftNames}
                    placeholder="Select aircraft from list"
                    loading={aircraftLoading}
                    disabled={isExecuting}
                  />
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="livery"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-foreground">Livery</FormLabel>
                  <Combobox
                    value={field.value}
                    onValueChange={field.onChange}
                    options={availableLiveries}
                    placeholder={
                      selectedAircraftName
                        ? 'Select livery from list'
                        : 'Select aircraft to see liveries'
                    }
                    loading={aircraftLoading}
                    disabled={isExecuting}
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
                      'Add Aircraft'
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
                      'Add Aircraft'
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
