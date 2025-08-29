'use client';

import { Check, Copy, Key } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { resetPasswordAction } from '@/actions/users/reset-password';
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

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  canResetPassword?: boolean;
}

export function ResetPasswordDialog({
  userId,
  userName,
  canResetPassword = true,
}: ResetPasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[420px]',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const { execute: executeReset, isExecuting: isResetting } = useAction(
    resetPasswordAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success && data.tempPassword) {
          toast.success(data.message);
          setTempPassword(data.tempPassword);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to reset password');
      },
    }
  );

  const handleReset = () => {
    executeReset({ userId });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy password');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTempPassword('');
      setCopied(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTempPassword('');
    setCopied(false);
  };

  if (!canResetPassword || !mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="text-white bg-blue-600 hover:bg-blue-700"
          disabled={!canResetPassword}
        >
          <Key className="h-4 w-4" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} max-w-[380px]`}
        style={dialogStyles.style}
        showCloseButton
        transitionFrom="bottom-left"
      >
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            {!tempPassword ? (
              <>
                Are you sure you want to reset the password for{' '}
                <strong>{userName}</strong>? A new temporary password will be
                generated that they can use to log in.
              </>
            ) : (
              'Password has been reset successfully. Please provide this temporary password to the user.'
            )}
          </DialogDescription>
        </DialogHeader>

        {!tempPassword ? (
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> The user will need to change this password
              on their next login. Make sure to securely share the temporary
              password with them.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temp-password">Temporary Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="temp-password"
                  type="text"
                  value={tempPassword}
                  readOnly
                  className="font-mono flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0 h-10 px-3"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Success!</strong> The password has been reset. Please
                securely share this temporary password with the user.
              </p>
            </div>
          </div>
        )}

        <ResponsiveDialogFooter
          primaryButton={
            !tempPassword
              ? {
                  label: 'Reset Password',
                  onClick: handleReset,
                  disabled: isResetting,
                  loading: isResetting,
                  loadingLabel: 'Resetting...',
                  className: 'bg-blue-600 hover:bg-blue-700 text-white',
                }
              : undefined
          }
          secondaryButton={{
            label: tempPassword ? 'Close' : 'Cancel',
            onClick: handleClose,
            disabled: isResetting,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
