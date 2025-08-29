'use client';

import { Navigation } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getAirportInfoAction } from '@/actions/routes/get-airport-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountryFlag } from '@/components/ui/country-flag';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useResponsiveDialog } from '@/hooks/use-responsive-dialog';
import {
  formatHoursMinutes,
  getResponsiveCardStyles,
  shortenAirportName,
} from '@/lib/utils';

interface RouteDetailsDialogProps {
  departureIcao: string;
  arrivalIcao: string;
  flightNumbers?: string[];
  flightTime?: number;
  aircraftNames?: string[];
  trigger?: React.ReactNode;
}

interface AirportInfo {
  name: string;
  country: string;
}

export function RouteDetailsDialog({
  departureIcao,
  arrivalIcao,
  flightNumbers = [],
  flightTime,
  aircraftNames = [],
  trigger,
}: RouteDetailsDialogProps) {
  const [departureInfo, setDepartureInfo] = useState<AirportInfo | null>(null);
  const [arrivalInfo, setArrivalInfo] = useState<AirportInfo | null>(null);
  const { isMobile, dialogStyles } = useResponsiveDialog();
  const cardStyles = getResponsiveCardStyles(
    isMobile,
    'border border-input bg-panel/30 mb-4'
  );

  useEffect(() => {
    let ignore = false;
    const fetchAirportInfo = async () => {
      const [dep, arr] = await Promise.all([
        getAirportInfoAction(departureIcao),
        getAirportInfoAction(arrivalIcao),
      ]);
      if (!ignore) {
        setDepartureInfo(dep && dep.success && dep.data ? dep.data : null);
        setArrivalInfo(arr && arr.success && arr.data ? arr.data : null);
      }
    };
    fetchAirportInfo();
    return () => {
      ignore = true;
    };
  }, [departureIcao, arrivalIcao]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">View Route</Button>}
      </DialogTrigger>
      <DialogContent
        className={`${dialogStyles.className} ${!isMobile ? 'w-full max-w-[750px]' : ''} overflow-x-hidden`}
        style={{
          ...dialogStyles.style,
          ...(isMobile ? {} : { maxWidth: 750 }),
        }}
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Details
          </DialogTitle>
        </DialogHeader>

        <Card className={cardStyles.className} style={cardStyles.style}>
          <CardContent className="p-3 sm:p-6 overflow-x-hidden">
            {isMobile ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    {departureInfo?.country && (
                      <CountryFlag
                        countryCode={departureInfo.country}
                        size="sm"
                      />
                    )}
                    <span className="font-mono font-bold text-2xl text-foreground leading-tight">
                      {departureIcao}
                    </span>
                    {departureInfo?.name && (
                      <span
                        className="text-xs text-muted-foreground text-center w-[220px] truncate block"
                        title={departureInfo.name}
                      >
                        {shortenAirportName(
                          departureInfo.name,
                          isMobile ? 24 : 36
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <span className="h-6 w-10 relative">
                      <Image
                        src="/plane-icon.svg"
                        alt="Plane icon indicating route direction"
                        fill
                        sizes="40px"
                        className="object-contain opacity-80 invert dark:invert-0"
                        style={{ objectFit: 'contain' }}
                        priority={false}
                      />
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-2">
                    {arrivalInfo?.country && (
                      <CountryFlag
                        countryCode={arrivalInfo.country}
                        size="sm"
                      />
                    )}
                    <span className="font-mono font-bold text-2xl text-foreground leading-tight">
                      {arrivalIcao}
                    </span>
                    {arrivalInfo?.name && (
                      <span
                        className="text-xs text-muted-foreground text-center w-[220px] truncate block"
                        title={arrivalInfo.name}
                      >
                        {shortenAirportName(
                          arrivalInfo.name,
                          isMobile ? 24 : 36
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 w-full min-w-0">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-start min-w-0">
                    <span className="flex items-center w-full">
                      <span className="font-mono font-bold text-3xl text-foreground leading-tight">
                        {departureIcao}
                      </span>
                      {departureInfo?.country && (
                        <CountryFlag
                          countryCode={departureInfo.country}
                          size="sm"
                          className="ml-2"
                        />
                      )}
                    </span>
                    {departureInfo?.name && (
                      <span
                        className="text-xs text-muted-foreground mt-1 text-left truncate w-full block"
                        title={departureInfo.name}
                      >
                        {shortenAirportName(
                          departureInfo.name,
                          isMobile ? 24 : 36
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center px-4 flex-shrink-0">
                  <span className="h-6 w-10 relative flex-shrink-0">
                    <Image
                      src="/plane-icon.svg"
                      alt="Plane icon indicating route direction"
                      fill
                      sizes="40px"
                      className="object-contain opacity-80 invert dark:invert-0"
                      style={{ objectFit: 'contain' }}
                      priority={false}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-end flex-1 min-w-0">
                  <div className="flex flex-col items-end min-w-0">
                    <span className="flex items-center w-full justify-end">
                      {arrivalInfo?.country && (
                        <CountryFlag
                          countryCode={arrivalInfo.country}
                          size="sm"
                          className="mr-2"
                        />
                      )}
                      <span className="font-mono font-bold text-3xl text-foreground leading-tight">
                        {arrivalIcao}
                      </span>
                    </span>
                    {arrivalInfo?.name && (
                      <span
                        className="text-xs text-muted-foreground mt-1 text-right truncate w-full block"
                        title={arrivalInfo.name}
                      >
                        {shortenAirportName(
                          arrivalInfo.name,
                          isMobile ? 24 : 36
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {isMobile ? (
            <div className="space-y-3">
              {flightNumbers.length > 0 && (
                <div
                  className={
                    getResponsiveCardStyles(
                      isMobile,
                      'p-3 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                    ).className
                  }
                  style={
                    getResponsiveCardStyles(
                      isMobile,
                      'p-3 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                    ).style
                  }
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">
                        Flight Numbers
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {flightNumbers.map((flightNumber, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
                        >
                          {flightNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {flightTime && (
                <div
                  className={
                    getResponsiveCardStyles(
                      isMobile,
                      'p-3 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                    ).className
                  }
                  style={
                    getResponsiveCardStyles(
                      isMobile,
                      'p-3 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                    ).style
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-foreground">
                      Duration: {formatHoursMinutes(flightTime)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={
                getResponsiveCardStyles(
                  isMobile,
                  'flex items-center justify-between p-4 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                ).className
              }
              style={
                getResponsiveCardStyles(
                  isMobile,
                  'flex items-center justify-between p-4 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                ).style
              }
            >
              <div className="flex items-center gap-8 w-full">
                {flightNumbers.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">
                        Flight Numbers
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {flightNumbers.map((flightNumber, index) => (
                        <span
                          key={index}
                          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
                          style={{ lineHeight: '1.5' }}
                        >
                          {flightNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {flightTime && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-foreground">
                        Duration: {formatHoursMinutes(flightTime)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {aircraftNames.length > 0 && (
            <div
              className={
                getResponsiveCardStyles(
                  isMobile,
                  'p-3 sm:p-4 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                ).className
              }
              style={
                getResponsiveCardStyles(
                  isMobile,
                  'p-3 sm:p-4 bg-gradient-to-r from-panel/40 to-panel/20 border border-border/50'
                ).style
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    Available Aircraft
                  </span>
                </div>
                <div
                  className={`grid gap-2 ${isMobile ? 'pl-2' : 'pl-4'} ${isMobile && aircraftNames.length > 3 ? 'grid-cols-1' : ''}`}
                >
                  {aircraftNames.map((aircraft, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <div className="w-1 h-1 bg-muted-foreground/60 rounded-full flex-shrink-0"></div>
                      <span className={isMobile ? 'break-words' : ''}>
                        {aircraft}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
