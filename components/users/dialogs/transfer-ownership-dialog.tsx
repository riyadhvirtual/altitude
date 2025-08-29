'use client';

import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { transferOwnershipAction } from '@/actions/airline/transfer-ownership';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface TransferOwnershipDialogProps {
  userId: string;
  userName: string;
  canTransfer: boolean;
}

export function TransferOwnershipDialog({
  userId,
  userName,
  canTransfer,
}: TransferOwnershipDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { dialogStyles } = useResponsiveDialog();

  const { execute } = useAction(transferOwnershipAction, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setIsOpen(false);
        setConfirmationText('');
        router.refresh();
      } else {
        toast.error(data?.error || 'Failed to transfer ownership');
      }
      setIsLoading(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to transfer ownership');
      setIsLoading(false);
    },
  });

  const handleTransfer = () => {
    if (confirmationText !== 'CONFIRM') {
      toast.error('Please type the exact confirmation text');
      return;
    }

    setIsLoading(true);
    execute({ newOwnerId: userId });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationText('');
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="transfer"
          size="sm"
          disabled={!canTransfer}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-white" />
          Transfer Ownership
        </Button>
      </DialogTrigger>
      <DialogContent
        className={dialogStyles.className}
        style={dialogStyles.style}
        showCloseButton
        transitionFrom="bottom-left"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Transfer Ownership
          </DialogTitle>
          <DialogDescription>
            This action will transfer airline ownership to{' '}
            <strong>{userName}</strong>. You will lose all administrative
            privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-0 shadow-none">
            <AlertDescription>
              This action cannot be undone. The new owner will have full
              administrative access to the airline, and you will lose admin
              privileges, you will be granted all other roles.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Type &quot;CONFIRM&quot; to transfer ownership
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="CONFIRM"
              disabled={isLoading}
            />
          </div>
        </div>

        <ResponsiveDialogFooter
          primaryButton={{
            label: 'Transfer Ownership',
            onClick: handleTransfer,
            disabled: isLoading || confirmationText !== 'CONFIRM',
            loading: isLoading,
            loadingLabel: 'Transferring...',
            className:
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          }}
          secondaryButton={{
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            disabled: isLoading,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
