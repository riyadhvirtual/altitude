'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email format')),
});

type RequestPasswordResetFormInputs = z.infer<
  typeof requestPasswordResetSchema
>;

export default function RequestPasswordResetPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownSeconds = 20;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestPasswordResetFormInputs>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: RequestPasswordResetFormInputs) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: '/reset-password',
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to send reset email.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        `If an account is associated with this email address, you will receive a password reset email shortly. \n 
        Please check your spam folder.`
      );
      setCooldown(cooldownSeconds);
    } catch {
      setErrorMessage('An error occurred while sending the reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <h1 className="mb-4 text-center font-bold text-3xl text-foreground">
          Reset Password
        </h1>
        <p className="mb-6 text-center text-muted-foreground text-sm">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>

        {errorMessage && (
          <div className="mb-4 text-destructive text-center text-base font-normal">
            {errorMessage}
          </div>
        )}

        <form
          className="space-y-4 mt-4 text-foreground"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <Label htmlFor="email" className="mb-2 block">
              Email Address
            </Label>
            <Input
              autoComplete="email"
              disabled={isLoading || cooldown > 0}
              id="email"
              placeholder="Enter your email address"
              type="email"
              {...register('email')}
            />
            {errors.email && (
              <span className="block mt-1 text-destructive text-xs text-left">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button
            className="w-full"
            disabled={isLoading || cooldown > 0}
            type="submit"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {isLoading
              ? 'Sending Reset Email...'
              : cooldown > 0
                ? `Please wait ${cooldown}s...`
                : 'Send Reset Email'}
          </Button>

          {successMessage && (
            <div
              className="mt-4 rounded-md px-4 py-3 text-center text-sm"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              {successMessage}
            </div>
          )}
        </form>

        <span className="block mt-6 text-center text-muted-foreground text-sm">
          Remember your password?{' '}
          <Link className="text-primary hover:underline" href="/login">
            Back to Login
          </Link>
        </span>
      </div>
    </div>
  );
}
