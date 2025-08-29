import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { isSetupComplete } from '@/db/queries/airline';

import SetupWizard from './setup-wizard';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return {
    title: 'Setup',
  };
}

export default async function SetupPage() {
  const setupComplete = await isSetupComplete();

  if (setupComplete) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <SetupWizard />
      </div>
    </div>
  );
}
