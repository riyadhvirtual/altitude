import type { Metadata } from 'next';

import { AccountForm } from '@/components/account/account-form';
import { AvatarForm } from '@/components/account/avatar-form';
import { getAirline } from '@/db/queries/airline';
import { authCheck } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Settings',
  };
}

export default async function SettingsPage() {
  const session = await authCheck();
  const airline = await getAirline();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
            Settings
          </h3>
          <p className="text-muted-foreground">
            Manage your account information and profile settings
          </p>
        </div>
      </div>
      <AvatarForm
        userId={session.user.id}
        currentAvatarUrl={session.user.image || null}
        userName={session.user.name}
      />
      <AccountForm
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          callsign:
            (session.user as unknown as { callsign?: number | null })
              .callsign ?? null,
          discordUsername: session.user.discordUsername || undefined,
          discourseUsername: session.user.discourseUsername || undefined,
          infiniteFlightId: session.user.infiniteFlightId || undefined,
        }}
        airlineCallsign={airline?.callsign}
      />
    </div>
  );
}
