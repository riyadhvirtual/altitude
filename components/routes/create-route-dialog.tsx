'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createRouteAction } from '@/actions/routes/create-route';
import RouteForm from '@/components/routes/route-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface CreateRouteDialogProps {
  children: React.ReactNode;
  aircraft: { id: string; name: string; livery: string }[];
  onRouteCreated?: () => void;
}

export default function CreateRouteDialog({
  children,
  aircraft,
  onRouteCreated,
}: CreateRouteDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[480px]',
    baseClasses: 'max-h-[90vh] overflow-y-auto',
  });

  const handleSaved = () => {
    setOpen(false);
    router.refresh();
    onRouteCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} max-w-[420px]`}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Route</DialogTitle>
          <DialogDescription className="text-foreground">
            Fill details, select aircraft and add flight numbers.
          </DialogDescription>
        </DialogHeader>
        <RouteForm
          aircraft={aircraft}
          action={createRouteAction}
          onSaved={handleSaved}
          mode="create"
          submitText="Add Route"
          cancelButton={
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
