import { ArrowRight, CalendarDays, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { LocalTime } from '@/components/ui/local-time';
import { fileUrl } from '@/lib/urls';

export interface EventBannerProps {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  departureTime: Date;
  departureIcao: string;
  arrivalIcao: string;
  participantsCount: number;
  isCurrentlyHappening?: boolean;
}

export function EventBanner({
  id,
  title,
  description,
  imageUrl,
  departureTime,
  departureIcao,
  arrivalIcao,
  participantsCount,
  isCurrentlyHappening,
}: EventBannerProps) {
  const descriptionPreview = (description ?? '').slice(0, 220);

  return (
    <div className="overflow-hidden rounded-md border border-input bg-panel shadow-sm">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
        <div className="relative hidden h-40 md:block">
          {imageUrl ? (
            <img
              src={fileUrl(imageUrl)}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {title}
                </h3>
                {isCurrentlyHappening && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    LIVE
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-foreground sm:text-sm">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <LocalTime date={departureTime} />
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-mono">
                    {departureIcao} → {arrivalIcao}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {participantsCount} participant
                  {participantsCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Button asChild size="sm">
                <Link href={`/events/${id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {descriptionPreview && (
            <p className="mt-3 text-sm text-foreground">
              {descriptionPreview}
              {description && description.length > descriptionPreview.length
                ? '…'
                : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
