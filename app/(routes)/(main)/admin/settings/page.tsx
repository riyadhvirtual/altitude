import type { Metadata } from 'next';

import { db } from '@/db';
import { getAirline } from '@/db/queries';
import { discordConfig } from '@/db/schema';
import { requireAdmin } from '@/lib/auth-check';
import { fileUrl } from '@/lib/urls';

import { SettingsPageClient } from './settings-page-client';

export function generateMetadata(): Metadata {
  return {
    title: 'Settings',
  };
}

export default async function SettingsPage() {
  await requireAdmin();

  const airline = await getAirline();
  const discordConfigData = await db.select().from(discordConfig).get();
  // Future-proofing for when we have multiple tenants
  const tenantUsesAltitudeSubdomain =
    process.env.TENANT_USES_ALTITUDE_SUBDOMAIN === 'true';
  const authBrandingUrl = airline?.authImageUrl
    ? fileUrl(airline.authImageUrl)
    : null;

  if (!airline) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No airline data available.</p>
      </div>
    );
  }

  return (
    <SettingsPageClient
      airline={airline}
      discordConfigData={discordConfigData || null}
      tenantUsesAltitudeSubdomain={tenantUsesAltitudeSubdomain}
      authBrandingUrl={authBrandingUrl}
    />
  );
}
