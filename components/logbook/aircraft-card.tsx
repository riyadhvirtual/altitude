'use client';

import { Check, Edit2, X } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { editPirepAction } from '@/actions/pireps/edit-pirep';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AircraftOption {
  id: string;
  name: string;
  livery: string;
}

interface AircraftCardProps {
  name: string;
  livery?: string;
  className?: string;
  pirepId?: string;
  isEditable?: boolean;
  aircraftList?: AircraftOption[];
  currentAircraftId?: string;
  icon?: React.ReactNode;
}

export function AircraftCard({
  name,
  livery,
  className = '',
  pirepId,
  isEditable = false,
  aircraftList = [],
  currentAircraftId = '',
  icon,
}: AircraftCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(currentAircraftId);
  const [isHovering, setIsHovering] = useState(false);

  const current =
    aircraftList.find((a) => a.id === selectedId) ||
    aircraftList.find((a) => a.id === currentAircraftId);
  const displayName = current ? current.name : name;
  const displayLivery = current?.livery || livery;

  const { execute, isExecuting } = useAction(editPirepAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        setIsEditing(false);
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to update PIREP');
    },
  });

  const handleSave = () => {
    if (!selectedId) {
      toast.error('Select an aircraft');
      return;
    }
    execute({ id: pirepId!, aircraftId: selectedId });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedId(currentAircraftId);
    setIsHovering(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setIsHovering(false);
  };

  const renderContent = () => {
    if (isEditing && isEditable && pirepId) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 w-full">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="flex-1 h-10">
                <SelectValue placeholder="Select aircraft" />
              </SelectTrigger>
              <SelectContent>
                {aircraftList.map((ac) => (
                  <SelectItem key={ac.id} value={ac.id}>
                    {ac.name}
                    {ac.livery && ` (${ac.livery})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isExecuting}
              className="h-9 w-9 p-0 rounded-lg flex-shrink-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isExecuting}
              className="h-9 w-9 p-0 rounded-lg flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-start">
        <div className="flex flex-col gap-2">
          <div
            className={`group relative ${isEditable && pirepId ? 'cursor-pointer' : ''}`}
            onClick={() => isEditable && pirepId && handleStartEditing()}
            onMouseEnter={() => isEditable && pirepId && setIsHovering(true)}
            onMouseLeave={() => isEditable && pirepId && setIsHovering(false)}
          >
            <div className="flex flex-col items-start">
              <div className="font-bold text-3xl text-foreground leading-tight">
                {displayName}
              </div>
              {displayLivery && !displayName.includes('(') && (
                <div className="font-normal text-3xl text-foreground leading-tight">
                  ({displayLivery})
                </div>
              )}
            </div>
            {isEditable && pirepId && (
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
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`relative rounded-[var(--radius-sm)] border border-input bg-panel shadow-sm pt-4 pb-6 ${className}`}
    >
      <CardContent className="pt-0 pl-4 pr-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            {icon && (
              <span className="text-muted-foreground mr-0.5">{icon}</span>
            )}
            <p className="text-muted-foreground text-lg">Aircraft</p>
          </div>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
