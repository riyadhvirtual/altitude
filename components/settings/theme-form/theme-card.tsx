import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ThemeCardProps {
  selected: boolean;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    panel: string;
  };
  onSelect: () => void;
}

export function ThemeCard({
  selected,
  label,
  colors,
  onSelect,
}: ThemeCardProps) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all hover:shadow-md',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card hover:border-primary/50'
      )}
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex space-x-1">
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: colors.secondary }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: colors.panel }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm">{label}</h3>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div
            className="h-6 flex items-center px-2"
            style={{ backgroundColor: colors.primary }}
          >
            <div className="w-12 h-2 bg-white/80 rounded"></div>
          </div>
          <div
            className="h-8 flex items-center px-2 space-x-1"
            style={{ backgroundColor: colors.panel }}
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
