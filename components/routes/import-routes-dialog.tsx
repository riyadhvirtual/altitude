'use client';

import { Upload } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { importRoutesAction } from '@/actions/routes/import-routes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ResponsiveDialogFooter } from '@/components/ui/responsive-dialog-footer';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';

interface ImportRoutesDialogProps {
  children: React.ReactNode;
  onImported?: () => void;
}

export default function ImportRoutesDialog({
  children,
  onImported,
}: ImportRoutesDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { dialogStyles } = useResponsiveDialog({
    maxWidth: 'sm:max-w-[480px]',
    baseClasses: 'max-h-[90vh] overflow-y-auto',
  });

  const { execute, isExecuting } = useAction(importRoutesAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || 'Routes imported');
        setOpen(false);
        setFile(null);
        onImported?.();
      }
    },
    onError: ({ error }) =>
      toast.error(error.serverError || 'Failed to import routes'),
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }
    execute({ file });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} max-w-[420px]`}
        style={dialogStyles.style}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Import Routes</DialogTitle>
          <DialogDescription className="text-foreground">
            Upload a CSV to add multiple routes. Use the <code>aircraft</code>{' '}
            column and list each entry as <code>Aircraft Name - Livery</code>{' '}
            (semicolon separated). Example:{' '}
            <code>Airbus A320 - Air France; Airbus A320 - Air Asia</code>. Every
            entry must include a livery and be case sensitive. Aircraft must
            already exist in your fleet; unknown names or liveries will fail to
            import. Download the template to see the format.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a
                href="/templates/routes-template.csv"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Upload className="mr-2 h-4 w-4" /> Template
              </a>
            </Button>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <ResponsiveDialogFooter
            primaryButton={{
              label: isExecuting ? 'Importing...' : 'Import',
              onClick: () => handleSubmit(),
              disabled: isExecuting,
              loading: isExecuting,
              loadingLabel: 'Importing...',
            }}
            secondaryButton={{
              label: 'Cancel',
              onClick: () => setOpen(false),
              disabled: isExecuting,
            }}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
