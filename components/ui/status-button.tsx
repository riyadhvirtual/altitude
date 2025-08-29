import { type VariantProps } from 'class-variance-authority';
import { CheckCircle, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button, type ButtonProps, buttonVariants } from './button';

type Status = 'pending' | 'approved' | 'denied' | string;

interface StatusButtonProps extends Omit<ButtonProps, 'variant'> {
  status: Status;
}

export function StatusButton({
  status,
  className,
  children,
  ...props
}: StatusButtonProps) {
  type ButtonVariant = NonNullable<
    VariantProps<typeof buttonVariants>['variant']
  >;

  const normalizedStatus = status.toLowerCase();

  const statusVariant: ButtonVariant =
    normalizedStatus === 'approved'
      ? 'approve'
      : normalizedStatus === 'denied'
        ? 'deny'
        : 'secondary';

  const IconComponent =
    normalizedStatus === 'approved'
      ? CheckCircle
      : normalizedStatus === 'denied'
        ? XCircle
        : undefined;

  return (
    <Button variant={statusVariant} className={cn(className)} {...props}>
      {IconComponent && <IconComponent className="h-4 w-4" />}
      {children}
    </Button>
  );
}
