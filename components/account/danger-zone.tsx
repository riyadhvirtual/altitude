'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import { authClient } from '@/lib/auth-client';

interface DangerZoneProps {
  userName: string;
}

export function DangerZone({ userName }: DangerZoneProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[420px]',
  });

  const handleDelete = async (): Promise<void> => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      const { error: deleteError } = await authClient.deleteUser();

      if (deleteError) {
        const msg =
          deleteError.message ||
          ('serverError' in deleteError &&
            typeof (deleteError as { serverError?: string }).serverError ===
              'string' &&
            (deleteError as { serverError: string }).serverError) ||
          '' ||
          'Failed to delete account.';
        toast.error(msg);
        return;
      }

      toast.success('Account deleted successfully');
      router.replace('/');
    } catch (error: unknown) {
      let message = 'Failed to delete account.';
      if (error instanceof Error && error.message) {
        message = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'serverError' in error &&
        typeof (error as { serverError?: string }).serverError === 'string'
      ) {
        message = (error as { serverError: string }).serverError;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setConfirmText('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently delete your account, all your data, flight logs, and
          PIREPs. This action cannot be undone and you will lose access to all
          your information.
        </p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`${dialogStyles.className} max-w-[380px]`}
            style={dialogStyles.style}
            transitionFrom="center"
            showCloseButton
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <div className="space-y-3 text-left text-muted-foreground text-sm">
                <p>
                  <strong>This action cannot be undone.</strong> This will
                  permanently delete your account
                  <strong> {userName}</strong> and remove all of your data from
                  our servers.
                </p>
                <p>This includes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your profile and account information</li>
                  <li>All flight logs and PIREPs</li>
                  <li>Flight time and statistics</li>
                  <li>Any other associated data</li>
                </ul>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm font-medium text-destructive mb-2">
                  To confirm deletion, please type{' '}
                  <code className="bg-muted px-1 rounded">DELETE</code> below:
                </p>
                <Label htmlFor="confirm-delete" className="sr-only">
                  Type DELETE to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="mt-2"
                  disabled={loading}
                />
              </div>
            </div>

            <ResponsiveDialogFooter
              secondaryButton={{
                label: 'Cancel',
                onClick: handleDialogClose,
                disabled: loading,
                type: 'button',
              }}
              primaryButton={{
                label: 'Delete Account',
                onClick: handleDelete,
                disabled: loading || confirmText !== 'DELETE',
                loading: loading,
                loadingLabel: 'Deleting...',
                type: 'button',
                className:
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
