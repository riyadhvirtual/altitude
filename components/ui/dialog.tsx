'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const getTransitionClasses = (
  transitionFrom:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center'
    | 'top-right'
    | 'bottom-left'
    | 'top-left'
) => {
  switch (transitionFrom) {
    case 'center':
      return 'data-[state=closed]:scale-95 data-[state=open]:scale-100';
    case 'bottom-left':
      return 'data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-bottom-full';
    case 'top-right':
      return 'data-[state=closed]:slide-out-to-right-full data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-right-full data-[state=open]:slide-in-from-top-full';
    case 'top-left':
      return 'data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-top-full';
    default:
      return 'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]';
  }
};

/**
 * DialogContent: By default, closes on outside click and Escape key (Radix default).
 * To override, pass custom onPointerDownOutside or onEscapeKeyDown handlers as props.
 * Optionally, set showCloseButton to true to display an X icon in the top right for closing.
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    transitionFrom?:
      | 'top'
      | 'bottom'
      | 'left'
      | 'right'
      | 'center'
      | 'top-right'
      | 'bottom-left'
      | 'top-left';
  }
>(
  (
    {
      className,
      children,
      showCloseButton = false,
      transitionFrom = 'top-right',
      onPointerDownOutside,
      onEscapeKeyDown,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        onPointerDownOutside={onPointerDownOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        ref={ref}
        aria-describedby={props['aria-describedby'] ?? undefined}
        className={cn(
          // Base animations
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          // Positioning: mobile gets generous top/bottom insets and side padding; desktop centers
          'fixed z-50 grid gap-4 bg-card p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in focus:outline-none',
          // Mobile layout: default to sheet-like bounds; callers can override via className from utils
          'inset-x-4 top-12 bottom-12 w-auto max-w-[calc(100vw-2rem)] max-h-[calc(100svh-6rem)] overflow-y-auto rounded-md sm:inset-auto',
          // Desktop layout: center with transforms and tighter max sizes
          'sm:inset-x-auto sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-h-[85vh] sm:rounded-lg',
          getTransitionClasses(transitionFrom),
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className="absolute top-3.5 right-4 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow disabled:pointer-events-none group"
            style={{ background: 'none', boxShadow: 'none' }}
          >
            <X className="h-5 w-5 transition-colors text-muted-foreground group-hover:text-foreground" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn(
      'font-semibold text-lg leading-none tracking-tight',
      className
    )}
    ref={ref}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn('text-muted-foreground text-sm', className)}
    ref={ref}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
