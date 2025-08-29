'use client';

import { AirlineLogoProvider } from '@/components/providers/airline-logo-provider';

export function AirlineLogoWrapper({
  children,
  light,
  dark,
}: {
  children: React.ReactNode;
  light: string | null;
  dark: string | null;
}) {
  return (
    <AirlineLogoProvider light={light} dark={dark}>
      {children}
    </AirlineLogoProvider>
  );
}
