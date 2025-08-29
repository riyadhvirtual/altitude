import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Preview } from './constants';

interface CustomThemeCardProps {
  selected: boolean;
  name: string;
  preview?: Preview;
  onSelect: () => void;
  deleteMode?: boolean;
  onRemove?: () => void;
}

export function CustomThemeCard({
  selected,
  name,
  preview,
  onSelect,
  deleteMode = false,
  onRemove,
}: CustomThemeCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-md',
        deleteMode
          ? 'border-destructive bg-destructive/5 hover:border-destructive'
          : selected
            ? 'border-primary bg-primary/5 shadow-md'
            : 'border-border bg-card hover:border-primary/50'
      )}
      onClick={() => {
        if (deleteMode && onRemove) {
          onRemove();
          return;
        }
        onSelect();
      }}
    >
      {selected && !deleteMode && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {deleteMode && (
        <div className="absolute top-2 right-2 rounded bg-destructive px-2 py-0.5 text-[10px] font-semibold text-destructive-foreground">
          Remove
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex space-x-1">
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preview?.primary || '#000' }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preview?.secondary || '#eee' }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preview?.accent || '#ddd' }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: preview?.panel || '#f7f7f8' }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm">{name}</h3>
          {deleteMode && (
            <p className="text-xs text-destructive mt-0.5">Click to remove</p>
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          <div
            className="h-6 flex items-center px-2"
            style={{ backgroundColor: preview?.primary || '#000' }}
          >
            <div className="w-12 h-2 bg-white/80 rounded"></div>
          </div>
          <div
            className="h-8 flex items-center px-2 space-x-1"
            style={{ backgroundColor: preview?.panel || '#f7f7f8' }}
          >
            <div className="w-4 h-1.5 bg-black/20 rounded"></div>
            <div className="w-6 h-1.5 bg-black/20 rounded"></div>
            <div className="w-3 h-1.5 bg-black/20 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
