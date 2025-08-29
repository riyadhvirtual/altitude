'use client';

import { Check, Edit2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { editPirepAction } from '@/actions/pireps/edit-pirep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InlineIcaoEditorProps {
  pirepId: string;
  field: 'departureIcao' | 'arrivalIcao';
  value: string;
  className?: string;
}

export function InlineIcaoEditor({
  pirepId,
  field,
  value,
  className = '',
}: InlineIcaoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const { execute, isExecuting } = useAction(editPirepAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setIsEditing(false);
        router.refresh();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update PIREP');
    },
  });

  const handleSave = () => {
    if (!inputValue) {
      toast.error('ICAO cannot be empty');
      return;
    }
    if (inputValue.length !== 4) {
      toast.error('ICAO must be exactly 4 letters');
      return;
    }
    if (!/^[A-Z]{4}$/.test(inputValue)) {
      toast.error('ICAO must contain only uppercase letters');
      return;
    }
    execute({ id: pirepId, [field]: inputValue });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(value);
    setIsHovering(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setIsHovering(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
        <Input
          value={inputValue}
          onChange={(e) =>
            setInputValue(
              e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase()
            )
          }
          maxLength={4}
          className="w-14 sm:w-20 h-8 sm:h-12 font-mono text-lg sm:text-3xl font-bold text-center border-2 border-primary"
          disabled={isExecuting}
          autoFocus
        />
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isExecuting}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isExecuting}
            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleStartEditing}
    >
      <span className="font-mono font-bold text-2xl sm:text-3xl text-foreground leading-none">
        {value}
      </span>
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="bg-background/90 backdrop-blur-sm rounded-md p-2 shadow-lg border border-border"
          style={{
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)',
          }}
        >
          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        </div>
      </div>
    </div>
  );
}
