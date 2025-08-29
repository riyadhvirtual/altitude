import Image from 'next/image';

import { InlineIcaoEditor } from '@/components/logbook/inline-icao-editor';
import { Card, CardContent } from '@/components/ui/card';
import { CountryFlag } from '@/components/ui/country-flag';

interface RouteCardProps {
  departureIcao: string;
  arrivalIcao: string;
  className?: string;
  pirepId?: string;
  isEditable?: boolean;
  departureName?: string;
  arrivalName?: string;
  departureCountry?: string;
  arrivalCountry?: string;
  icon?: React.ReactNode;
}

export function RouteCard({
  departureIcao,
  arrivalIcao,
  className = '',
  pirepId,
  isEditable = false,
  departureName,
  arrivalName,
  departureCountry,
  arrivalCountry,
  icon,
}: RouteCardProps) {
  const renderIcao = (
    icao: string,
    field: 'departureIcao' | 'arrivalIcao',
    airportName?: string,
    countryCode?: string
  ) => {
    const icaoElement =
      isEditable && pirepId ? (
        <InlineIcaoEditor pirepId={pirepId} field={field} value={icao} />
      ) : (
        <span className="font-mono font-bold text-2xl sm:text-3xl text-foreground leading-tight">
          {icao}
        </span>
      );

    if (field === 'departureIcao') {
      return (
        <div className="flex flex-col items-start min-w-0">
          <span className="flex items-center w-full">
            {icaoElement}
            {countryCode && (
              <CountryFlag
                countryCode={countryCode}
                size="sm"
                className="ml-1 sm:ml-2"
              />
            )}
          </span>
          {airportName && (
            <span className="text-xs text-muted-foreground mt-1 text-left truncate max-w-full">
              {airportName}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-end min-w-0">
          <span className="flex items-center w-full justify-end">
            {countryCode && (
              <CountryFlag
                countryCode={countryCode}
                size="sm"
                className="mr-1 sm:mr-2"
              />
            )}
            {icaoElement}
          </span>
          {airportName && (
            <span className="text-xs text-muted-foreground mt-1 text-right truncate max-w-full">
              {airportName}
            </span>
          )}
        </div>
      );
    }
  };

  return (
    <Card
      className={`relative rounded-[var(--radius-sm)] border border-input bg-panel shadow-sm pt-4 pb-6 ${className}`}
    >
      <CardContent className="pt-0 pl-3 pr-3 sm:pl-4 sm:pr-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            {icon && (
              <span className="text-muted-foreground mr-0.5">{icon}</span>
            )}
            <p className="text-muted-foreground text-base sm:text-lg">Route</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center flex-1 min-w-0">
            {renderIcao(
              departureIcao,
              'departureIcao',
              departureName,
              departureCountry
            )}
          </div>
          <div className="flex items-center justify-center px-2 sm:px-4 flex-shrink-0">
            <span className="h-4 w-auto sm:h-6 relative flex items-center">
              <Image
                src="/plane-icon.svg"
                alt="Plane icon indicating route direction"
                width={32}
                height={24}
                className="h-4 w-auto sm:h-6 opacity-80 invert dark:invert-0"
                style={{ height: '100%', width: 'auto' }}
                priority={false}
              />
            </span>
          </div>
          <div className="flex items-center justify-end flex-1 min-w-0">
            {renderIcao(
              arrivalIcao,
              'arrivalIcao',
              arrivalName,
              arrivalCountry
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
