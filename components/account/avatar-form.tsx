'use client';

import { useAction } from 'next-safe-action/hooks';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  resetAvatarAction,
  uploadAvatarAction,
} from '@/actions/account/upload-avatar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IMAGE_MAX_MB } from '@/lib/constants';
import { userAvatarUrl } from '@/lib/urls';

interface AvatarFormProps {
  userId: string;
  currentAvatarUrl: string | null;
  userName: string;
}

export function AvatarForm({
  userId,
  currentAvatarUrl,
  userName,
}: AvatarFormProps) {
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl ? userAvatarUrl(currentAvatarUrl) : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { execute, isExecuting } = useAction(uploadAvatarAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success('Avatar updated');
        const publicUrl = userAvatarUrl(data.url) + `?t=${Date.now()}`;
        setPreview(publicUrl);
      }
    },
    onError: ({ error }) => toast.error(error.serverError ?? 'Upload failed'),
  });

  const { execute: resetAvatar, isExecuting: isResetting } = useAction(
    resetAvatarAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          toast.success('Avatar removed');
          setPreview(null);
        }
      },
      onError: ({ error }) => toast.error(error.serverError ?? 'Reset failed'),
    }
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // quick client-side validation
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Unsupported file type');
      return;
    }
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      toast.error(`File too large (max ${IMAGE_MAX_MB} MB)`);
      return;
    }

    // preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    execute({ userId, file });
  };

  const trigger = () => fileInputRef.current?.click();

  const nameInitial = userName.charAt(0).toUpperCase();

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Update your avatar. This will be visible to other users. This might
          take a few minutes to update.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            {preview ? (
              <img
                src={preview}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="h-full w-full flex items-center justify-center bg-primary/10">
                <span className="font-medium text-primary text-lg">
                  {nameInitial}
                </span>
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isExecuting}
                onClick={trigger}
                className="w-full sm:w-auto"
              >
                {isExecuting ? 'Uploading…' : 'Choose file'}
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isExecuting || isResetting}
                  onClick={() => resetAvatar({ userId })}
                  className="w-full sm:w-auto"
                >
                  {isResetting ? 'Removing…' : 'Remove Avatar'}
                </Button>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFile}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP ≤ {IMAGE_MAX_MB} MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
