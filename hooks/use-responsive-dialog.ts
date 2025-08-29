import { useIsMobile } from '@/hooks/use-mobile';
import { getResponsiveDialogStyles } from '@/lib/utils';

interface UseResponsiveDialogOptions {
  maxWidth?: string;
  baseClasses?: string;
  mobileMode?: 'sheet' | 'fit';
}

export function useResponsiveDialog(options: UseResponsiveDialogOptions = {}) {
  const isMobile = useIsMobile();
  const {
    maxWidth = 'sm:max-w-[425px]',
    baseClasses = 'border border-border bg-card shadow-lg',
    mobileMode,
  } = options;

  // Infer mobile mode: use compact 'fit' for small dialogs, sheet for large
  const inferredMobileMode: 'sheet' | 'fit' = (() => {
    if (mobileMode) {
      return mobileMode;
    }
    const match = maxWidth.match(/(\d+)px/);
    const px = match ? parseInt(match[1], 10) : 425;
    return px <= 500 ? 'fit' : 'sheet';
  })();

  const dialogStyles = getResponsiveDialogStyles(
    isMobile,
    baseClasses,
    maxWidth,
    inferredMobileMode
  );

  return {
    isMobile,
    dialogStyles,
  };
}
