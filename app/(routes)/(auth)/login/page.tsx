import type { Metadata } from 'next';

import { getAirline } from '@/db/queries/airline';
import { fileUrl } from '@/lib/urls';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign In - Altitude',
  description:
    'Sign in to your Altitude Crew Center account to track and log your flights.',
};

export default async function LoginPage() {
  const airline = await getAirline();
  const lightLogo = airline?.lightLogoUrl
    ? fileUrl(airline.lightLogoUrl)
    : '/fallback_light.svg';
  const darkLogo = airline?.darkLogoUrl
    ? fileUrl(airline.darkLogoUrl)
    : '/fallback_dark.svg';
  const authImageUrl = airline?.authImageUrl
    ? fileUrl(airline.authImageUrl)
    : null;

  return (
    <LoginForm
      lightLogo={lightLogo}
      darkLogo={darkLogo}
      authImageUrl={authImageUrl}
    />
  );
}
