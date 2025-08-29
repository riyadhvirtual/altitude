'use client';

import { CheckCircle, ShieldQuestion, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { denyApplicationAction } from '@/actions/users/deny-application';
import { verifyUserAction } from '@/actions/users/verify-user';
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

interface ReviewApplicationDialogProps {
  userId: string;
  userName: string;
}

export function ReviewApplicationDialog({
  userId,
  userName,
}: ReviewApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { dialogStyles, isMobile } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[420px]',
  });

  const { execute: executeVerify, isExecuting: isVerifying } = useAction(
    verifyUserAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message);
          setOpen(false);
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to verify user');
      },
    }
  );

  const { execute: executeDeny, isExecuting: isDenying } = useAction(
    denyApplicationAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success(data.message);
          setOpen(false);
          router.refresh();
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || 'Failed to deny application');
      },
    }
  );

  const handleVerify = () => {
    executeVerify({ id: userId });
  };

  const handleDeny = () => {
    executeDeny({ userId });
  };

  const isProcessing = isVerifying || isDenying;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ShieldQuestion className="h-4 w-4 mr-2" />
          Review Application
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} max-w-[380px]`}
        style={dialogStyles.style}
        showCloseButton
        transitionFrom="bottom-left"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            Review User Application
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-left">
            Review the application for <strong>{userName}</strong>. You can
            either verify their account or deny their application.
          </DialogDescription>
        </DialogHeader>
        <div
          className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end gap-3'} pt-4`}
        >
          {isMobile ? (
            <>
              <Button
                onClick={handleVerify}
                disabled={isProcessing}
                variant="accept"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4" />
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                onClick={handleDeny}
                disabled={isProcessing}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="h-4 w-4" />
                {isDenying ? 'Denying...' : 'Deny'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
                className="w-full"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
                className="border border-border bg-background text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeny}
                  disabled={isProcessing}
                  variant="destructive"
                  className="min-w-[100px]"
                >
                  <XCircle className="h-4 w-4" />
                  {isDenying ? 'Denying...' : 'Deny'}
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isProcessing}
                  variant="accept"
                  className="min-w-[100px]"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
