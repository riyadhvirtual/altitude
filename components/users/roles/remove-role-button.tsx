'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { removeRoleAction } from '@/actions/users/remove-role';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface RemoveRoleButtonProps {
  userId: string;
  role: string;
  userName?: string;
  className?: string;
}

export function RemoveRoleButton({
  userId,
  role,
  userName,
  className,
}: RemoveRoleButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refetch } = useSession();
  const { dialogStyles } = useResponsiveDialog();

  const { execute } = useAction(removeRoleAction, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        // Refresh the session to get updated roles
        await refetch();
        router.refresh();
        setOpen(false);
      }
      setIsLoading(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to remove role');
      setIsLoading(false);
    },
  });

  const handleRemove = () => {
    setIsLoading(true);
    execute({ userId, role });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn(
            'h-4 w-4 p-0 transition-colors disabled:opacity-50 flex items-center justify-center text-primary hover:text-primary/80',
            className
          )}
        >
          <X className="h-6 w-6" />
        </button>
      </DialogTrigger>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
        transitionFrom="bottom-left"
      >
        <DialogHeader>
          <DialogTitle>Remove Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the{' '}
            <strong>{role.replace('_', ' ')}</strong> role
            {userName ? ` from ${userName}` : ''}?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Warning:</strong> Removing this role will immediately revoke
            all associated permissions and access rights.
          </p>
        </div>

        <ResponsiveDialogFooter
          primaryButton={{
            label: 'Remove Role',
            onClick: handleRemove,
            disabled: isLoading,
            loading: isLoading,
            loadingLabel: 'Removing...',
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          }}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => setOpen(false),
            disabled: isLoading,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
