'use client';

import { createContext, useContext } from 'react';

const LogoCtx = createContext<{ light: string | null; dark: string | null }>({
  light: null,
  dark: null,
});

export function AirlineLogoProvider({
  light,
  dark,
  children,
}: {
  light: string | null;
  dark: string | null;
  children: React.ReactNode;
}) {
  return (
    <LogoCtx.Provider value={{ light, dark }}>{children}</LogoCtx.Provider>
  );
}

export function useAirlineLogo(type: 'light' | 'dark'): string {
  const { light, dark } = useContext(LogoCtx);
  return type === 'light'
    ? (light ?? '/fallback_dark.svg')
    : (dark ?? '/fallback_light.svg');
}
