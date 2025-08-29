'use client';

import { Check, Edit2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { editPirepAction } from '@/actions/pireps/edit-pirep';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InlineFlightNumberEditorProps {
  pirepId: string;
  value: string;
  className?: string;
}

export function InlineFlightNumberEditor({
  pirepId,
  value,
  className = '',
}: InlineFlightNumberEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isHovering, setIsHovering] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  // Measure text width dynamically
  useEffect(() => {
    if (measureRef.current && inputRef.current && isEditing) {
      // Copy computed styles from input to measurement span
      const inputStyles = window.getComputedStyle(inputRef.current);
      const measureSpan = measureRef.current;

      measureSpan.style.fontSize = inputStyles.fontSize;
      measureSpan.style.fontFamily = inputStyles.fontFamily;
      measureSpan.style.fontWeight = inputStyles.fontWeight;
      measureSpan.style.letterSpacing = inputStyles.letterSpacing;
      measureSpan.style.lineHeight = inputStyles.lineHeight;

      measureSpan.textContent = inputValue || 'W';
      const width = measureSpan.getBoundingClientRect().width;
      setInputWidth(Math.max(width + 8, 30)); // +8px for padding, minimum 30px
    }
  }, [inputValue, isEditing]);

  const handleSave = () => {
    if (!inputValue.trim()) {
      toast.error('Flight number cannot be empty');
      return;
    }
    if (inputValue.length > 10) {
      toast.error('Flight number cannot exceed 10 characters');
      return;
    }
    execute({ id: pirepId, flightNumber: inputValue.trim() });
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
      <span className={`inline-flex items-center gap-2 ${className} relative`}>
        {/* Hidden span to measure text width */}
        <span
          ref={measureRef}
          className="absolute -top-96 left-0 opacity-0 pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={10}
          className="inline-block py-1 text-inherit font-inherit border-2 border-primary bg-transparent"
          disabled={isExecuting}
          autoFocus
          style={{
            fontSize: 'inherit',
            lineHeight: 'inherit',
            width: inputWidth > 0 ? `${inputWidth}px` : 'auto',
            minWidth: '30px',
            padding: '0 4px',
            textAlign: 'left',
          }}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isExecuting}
          className="h-6 w-6 p-0 ml-1"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isExecuting}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </span>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleStartEditing}
    >
      <span>{value}</span>
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
          <Edit2 className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </div>
  );
}
