'use client';

import { Trash2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface RemoveThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function RemoveThemeDialog({
  open,
  onOpenChange,
  themeName,
  onConfirm,
  loading = false,
}: RemoveThemeDialogProps) {
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[420px]',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${dialogStyles.className} max-w-[420px]`}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" /> Remove Theme
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the custom theme &quot;{themeName}
            &quot;? This deletes the uploaded CSS file and removes it from the
            list.
          </DialogDescription>
        </DialogHeader>

        <ResponsiveDialogFooter
          primaryButton={{
            label: 'Remove',
            onClick: onConfirm,
            disabled: loading,
            loading,
            loadingLabel: 'Removing...',
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          }}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => onOpenChange(false),
            disabled: loading,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
