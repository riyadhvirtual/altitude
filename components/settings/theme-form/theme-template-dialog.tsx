'use client';

import { toast } from 'sonner';

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

import { TEMPLATE_CSS } from './constants';

export function ThemeTemplateDialog() {
  const { dialogStyles } = useResponsiveDialog({ maxWidth: 'sm:max-w-3xl' });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          Theme template & example
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        transitionFrom="center"
        className={`${dialogStyles.className} p-4 sm:p-6 max-w-[95vw] sm:max-w-3xl`}
        style={dialogStyles.style}
      >
        <DialogHeader>
          <DialogTitle>Theme template</DialogTitle>
          <DialogDescription>
            Copy this CSS as a starting point. Define variables for both light
            (:root) and dark (.dark).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(TEMPLATE_CSS);
                toast.success('Template copied');
              }}
              className="w-full sm:w-auto"
              size="sm"
            >
              Copy
            </Button>
            <Button
              type="button"
              onClick={() => {
                const blob = new Blob([TEMPLATE_CSS], { type: 'text/css' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'theme-template.css';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full sm:w-auto"
              size="sm"
            >
              Download
            </Button>
          </div>
          <pre className="max-h-[60vh] overflow-auto rounded bg-muted p-3 text-xs whitespace-pre-wrap break-words">
            <code>{TEMPLATE_CSS}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
