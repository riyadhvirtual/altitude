import './globals.css';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';

import { AirlineLogoWrapper } from '@/components/providers/airline-logo-wrapper';
import { getAirline } from '@/db/queries/airline';
import { fileUrl } from '@/lib/urls';

// Force dynamic rendering to avoid build-time DB access during prerender/export
// We don't need to prerender any page anyway
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Altitude',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const airline = await getAirline();
  const lightLogo = airline?.lightLogoUrl
    ? fileUrl(airline.lightLogoUrl)
    : null;
  const darkLogo = airline?.darkLogoUrl ? fileUrl(airline.darkLogoUrl) : null;
  const favicon = airline?.faviconUrl ? fileUrl(airline.faviconUrl) : null;

  const themeValue = (airline?.theme || 'default').trim();
  const airlineThemeHref =
    themeValue && themeValue !== 'default'
      ? /^https?:\/\//i.test(themeValue)
        ? themeValue
        : themeValue.startsWith('/styles/')
          ? themeValue
          : themeValue.startsWith('/')
            ? fileUrl(themeValue)
            : `/styles/${themeValue}.css`
      : null;

  const analyticsEndpoint = process.env.ANALYTICS_ENDPOINT;
  const analyticsId = process.env.ANALYTICS_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {favicon && <link rel="icon" type="image/x-icon" href={favicon} />}
        {airlineThemeHref && (
          <link
            rel="stylesheet"
            href={airlineThemeHref}
            data-airline-theme={themeValue}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} m-0 w-full p-0 antialiased`}
      >
        <AirlineLogoWrapper light={lightLogo} dark={darkLogo}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
          <Toaster />
        </AirlineLogoWrapper>
      </body>
      {analyticsEndpoint && analyticsId ? (
        <script
          async
          defer
          src={analyticsEndpoint}
          data-website-id={analyticsId}
        />
      ) : null}
    </html>
  );
}
