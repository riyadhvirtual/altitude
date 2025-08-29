import type { Metadata } from 'next';

import { getAirline } from '@/db/queries/airline';
import { fileUrl } from '@/lib/urls';

import SignupPage from './client-page';

export const metadata: Metadata = {
  title: 'Sign Up - Altitude',
};

export default async function Signup() {
  const airlineRaw = await getAirline();
  const lightLogo = airlineRaw?.lightLogoUrl
    ? fileUrl(airlineRaw.lightLogoUrl)
    : '/fallback_light.svg';
  const darkLogo = airlineRaw?.darkLogoUrl
    ? fileUrl(airlineRaw.darkLogoUrl)
    : '/fallback_dark.svg';
  const authImageUrl = airlineRaw?.authImageUrl
    ? fileUrl(airlineRaw.authImageUrl)
    : null;

  const airline = airlineRaw
    ? {
        ...airlineRaw,
        lightLogo,
        darkLogo,
        callsignMinRange: airlineRaw.callsignMinRange,
        callsignMaxRange: airlineRaw.callsignMaxRange,
      }
    : undefined;

  return (
    <SignupPage
      lightLogo={lightLogo}
      darkLogo={darkLogo}
      airline={airline}
      authImageUrl={authImageUrl}
    />
  );
}
