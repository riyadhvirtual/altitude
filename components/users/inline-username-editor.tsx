'use client';

import { Check, Edit2, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { updateUsernameAction } from '@/actions/users/update-username';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InlineUsernameEditorProps {
  userId: string;
  currentName: string | null;
  disabled?: boolean;
  textClassName?: string;
}

export function InlineUsernameEditor({
  userId,
  currentName,
  disabled = false,
  textClassName,
}: InlineUsernameEditorProps) {
  const safeInitial = useMemo(() => currentName?.trim() ?? '', [currentName]);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(safeInitial);
  // Icon should always be visible; no hover state needed

  const { execute, isExecuting } = useAction(updateUsernameAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setIsEditing(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update name');
    },
  });

  const handleSave = () => {
    const value = inputValue.trim();

    if (value.length === 0) {
      toast.error('Please enter a name');
      return;
    }

    if (value.length > 30) {
      toast.error('Name must be at most 30 characters');
      return;
    }

    execute({ userId, name: value });
  };

  const handleCancel = () => {
    setInputValue(safeInitial);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayName =
    currentName && currentName.trim().length > 0 ? currentName : 'Unknown User';

  if (disabled) {
    return <h1 className={textClassName}>{displayName}</h1>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-60 md:w-80"
          placeholder="Enter name"
          type="text"
          autoFocus
          disabled={isExecuting}
          maxLength={30}
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
      onClick={() => setIsEditing(true)}
    >
      <h1 className={textClassName}>{displayName}</h1>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 rounded-sm transition-transform duration-150 group-hover:scale-110"
        aria-label="Edit name"
        title="Edit name"
      >
        <Edit2 className="h-3 w-3 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
      </Button>
    </div>
  );
}
