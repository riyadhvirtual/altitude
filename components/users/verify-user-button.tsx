'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { verifyUserAction } from '@/actions/users/verify-user';
import { Button } from '@/components/ui/button';

interface VerifyUserButtonProps {
  userId: string;
}

export function VerifyUserButton({ userId }: VerifyUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { execute } = useAction(verifyUserAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        router.refresh();
      }
      setIsLoading(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to verify user');
      setIsLoading(false);
    },
  });

  const handleVerify = () => {
    setIsLoading(true);
    execute({ id: userId });
  };

  return (
    <Button
      size="sm"
      variant="accept"
      onClick={handleVerify}
      disabled={isLoading}
    >
      <CheckCircle className="h-4 w-4" />
      {isLoading ? 'Verifying...' : 'Verify'}
    </Button>
  );
}
