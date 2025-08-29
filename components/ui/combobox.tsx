'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = 'Select option...',
  loading = false,
  disabled = false,
  className,
}: ComboboxProps) {
  const [isCustom, setIsCustom] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === '__custom__') {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    onValueChange(selectedValue);
  };

  const handleCustomInput = (newValue: string) => {
    onValueChange(newValue);
  };

  // Show custom input if user selected custom option or if current value isn't in options
  const showCustomInput =
    isCustom || (!options.includes(value) && value !== '');

  return (
    <div className={cn('w-full', className)}>
      {showCustomInput ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder="Enter custom value"
            disabled={disabled}
            className="w-full"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustom(false);
              onValueChange('');
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Choose from list instead
          </button>
        </div>
      ) : (
        <Select
          value={options.includes(value) ? value : ''}
          onValueChange={handleSelect}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" align="start">
            {[...new Set(options)].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem
              value="__custom__"
              className="text-muted-foreground italic"
            >
              Enter custom value...
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
