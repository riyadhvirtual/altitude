'use client';

import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveDialogFooterProps {
  primaryButton?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    className?: string;
    type?: 'button' | 'submit';
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit';
  };
  className?: string;
}

export function ResponsiveDialogFooter({
  primaryButton,
  secondaryButton,
  className = '',
}: ResponsiveDialogFooterProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end gap-3'} pt-4 ${className}`}
    >
      {isMobile ? (
        <>
          {primaryButton && (
            <Button
              onClick={primaryButton.onClick}
              disabled={primaryButton.disabled}
              type={primaryButton.type || 'button'}
              className={`min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 w-full ${primaryButton.className || ''}`}
            >
              {primaryButton.loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {primaryButton.loadingLabel ||
                    `${primaryButton.label.toLowerCase()}ing...`}
                </>
              ) : (
                primaryButton.label
              )}
            </Button>
          )}
          {secondaryButton && (
            <Button
              onClick={secondaryButton.onClick}
              disabled={secondaryButton.disabled}
              variant="outline"
              type={secondaryButton.type || 'button'}
              className={`border border-border bg-background text-foreground hover:bg-muted w-full ${secondaryButton.className || ''}`}
            >
              {secondaryButton.label}
            </Button>
          )}
        </>
      ) : (
        <>
          {secondaryButton && (
            <Button
              onClick={secondaryButton.onClick}
              disabled={secondaryButton.disabled}
              variant="outline"
              type={secondaryButton.type || 'button'}
              className={`border border-border bg-background text-foreground hover:bg-muted ${secondaryButton.className || ''}`}
            >
              {secondaryButton.label}
            </Button>
          )}
          {primaryButton && (
            <Button
              onClick={primaryButton.onClick}
              disabled={primaryButton.disabled}
              type={primaryButton.type || 'button'}
              className={`min-w-[100px] bg-primary text-primary-foreground hover:bg-primary/90 ${primaryButton.className || ''}`}
            >
              {primaryButton.loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {primaryButton.loadingLabel ||
                    `${primaryButton.label.toLowerCase()}ing...`}
                </>
              ) : (
                primaryButton.label
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
