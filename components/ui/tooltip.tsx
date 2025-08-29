'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type * as React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

function useIsTouchLike(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = '(hover: none) and (pointer: coarse)';
    const mediaQuery = window.matchMedia(query);
    const update = () => setIsTouch(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return isTouch;
}

const TooltipModeContext = createContext<boolean>(false);

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const isTouch = useIsTouchLike();
  const content = useMemo(() => children, [children]);

  if (isTouch) {
    return (
      <TooltipModeContext.Provider value={true}>
        <PopoverPrimitive.Root data-slot="tooltip-mobile-popover">
          {content}
        </PopoverPrimitive.Root>
      </TooltipModeContext.Provider>
    );
  }

  return (
    <TooltipModeContext.Provider value={false}>
      <TooltipProvider>
        <TooltipPrimitive.Root data-slot="tooltip" {...props}>
          {children}
        </TooltipPrimitive.Root>
      </TooltipProvider>
    </TooltipModeContext.Provider>
  );
}

function TooltipTrigger({
  className,
  onClick,
  tabIndex,
  role,
  asChild,
  children,
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const isTouch = useContext(TooltipModeContext);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (!event.defaultPrevented) {
      (event.currentTarget as HTMLElement).focus();
    }
  };

  if (isTouch) {
    return (
      <PopoverPrimitive.Trigger
        data-slot="tooltip-trigger"
        className={cn('cursor-pointer', className)}
        tabIndex={tabIndex ?? 0}
        role={role ?? 'button'}
        onClick={handleClick}
        asChild={asChild}
      >
        {children}
      </PopoverPrimitive.Trigger>
    );
  }

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      className={cn('cursor-default hover:cursor-pointer', className)}
      tabIndex={tabIndex ?? 0}
      role={role}
      onClick={handleClick}
      asChild={asChild}
    >
      {children}
    </TooltipPrimitive.Trigger>
  );
}

function TooltipContent({
  className,
  side = 'top',
  align = 'center',
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const isTouch = useContext(TooltipModeContext);

  if (isTouch) {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            'z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs shadow-md outline-hidden',
            className
          )}
          side={side}
          align={align}
          sideOffset={sideOffset}
          data-slot="tooltip-content"
        >
          {children}
          <PopoverPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in text-balance rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs data-[state=closed]:animate-out',
          className
        )}
        data-slot="tooltip-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
