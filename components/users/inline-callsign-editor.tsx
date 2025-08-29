'use client';

import { Check, Edit2, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateCallsignAction } from '@/actions/users/update-callsign';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InlineCallsignEditorProps {
  userId: string;
  currentCallsign: number | null;
  airlinePrefix: string;
  callsignMinRange: number;
  callsignMaxRange: number;
  disabled?: boolean;
  enforceRange?: boolean;
}

export function InlineCallsignEditor({
  userId,
  currentCallsign,
  airlinePrefix,
  callsignMinRange,
  callsignMaxRange,
  disabled = false,
  enforceRange = true,
}: InlineCallsignEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(
    currentCallsign?.toString() || ''
  );
  const [isHovering, setIsHovering] = useState(false);

  const { execute, isExecuting } = useAction(updateCallsignAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setIsEditing(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update callsign');
    },
  });

  const handleSave = () => {
    const callsignNumber = parseInt(inputValue, 10);
    if (isNaN(callsignNumber) || callsignNumber <= 0) {
      toast.error('Please enter a valid callsign number');
      return;
    }

    if (enforceRange) {
      if (
        callsignNumber < callsignMinRange ||
        callsignNumber > callsignMaxRange
      ) {
        toast.error(
          `Callsign must be between ${callsignMinRange} and ${callsignMaxRange}`
        );
        return;
      }
    }

    execute({ userId, callsign: callsignNumber });
  };

  const handleCancel = () => {
    setInputValue(currentCallsign?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow digits
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setInputValue(value);
  };

  const displayCallsign = currentCallsign
    ? `${airlinePrefix}${currentCallsign}`
    : '—';

  if (disabled) {
    return <p className="text-base font-medium">{displayCallsign}</p>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-16 h-8 text-base"
          placeholder={`${callsignMinRange}-${callsignMaxRange}`}
          type="text"
          autoFocus
          disabled={isExecuting}
          min={callsignMinRange}
          max={callsignMaxRange}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isExecuting}
          className="h-8 w-8 p-0"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isExecuting}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => setIsEditing(true)}
    >
      <p className="text-base font-medium">{displayCallsign}</p>
      <Button
        size="sm"
        variant="ghost"
        className={`h-6 w-6 p-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
