'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const [token] = useQueryState('token', parseAsString);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8">
          <h1 className="mb-4 text-center font-bold text-3xl text-foreground">
            Reset Password
          </h1>
          <Alert className="mb-4 border-destructive bg-destructive/10 text-destructive-foreground">
            <AlertDescription className="text-center">
              Invalid or missing reset token. Please request a new password
              reset.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Link className="text-primary hover:underline" href="/login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setErrorMessage('An error occurred while resetting your password.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-4 text-center font-bold text-3xl text-foreground">
        Reset Password
      </h1>

      {errorMessage && (
        <div className="mb-4 text-destructive text-center text-base font-normal">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <Alert className="mb-4 border-success bg-success/10 text-success-foreground">
          <AlertDescription className="text-center">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <form
        className="space-y-4 mt-4 text-foreground"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Label htmlFor="password" className="mb-2 block">
            New Password
          </Label>
          <div className="relative">
            <Input
              autoComplete="new-password"
              disabled={isLoading}
              id="password"
              placeholder="Enter your new password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <span className="block mt-1 text-destructive text-xs text-left">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="mb-2 block">
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              autoComplete="new-password"
              disabled={isLoading}
              id="confirmPassword"
              placeholder="Confirm your new password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
            />
            <button
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
              className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground"
              disabled={isLoading}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              type="button"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="block mt-1 text-destructive text-xs text-left">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lock className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      <span className="block mt-6 text-center text-muted-foreground text-sm">
        Remember your password?{' '}
        <Link className="text-primary hover:underline" href="/login">
          Back to Login
        </Link>
      </span>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
