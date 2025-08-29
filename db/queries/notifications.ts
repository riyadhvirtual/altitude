import { count } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { pireps, users } from '@/db/schema';

export const getPendingApplicationsCount = async () => {
  const result = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.verified, false));

  const applicationCount = result[0].value;

  return applicationCount;
};

export const getPendingPirepsCount = async () => {
  const result = await db
    .select({ value: count() })
    .from(pireps)
    .where(eq(pireps.status, 'pending'));

  const pirepCount = result[0].value;

  return pirepCount;
};
