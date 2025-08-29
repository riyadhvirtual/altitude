import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { getIFUserByDiscourseUsername } from '@/lib/if-api';
import { discordUsernameRegex } from '@/lib/validation/account';

interface UpdateAccountData {
  userId: string;
  name?: string;
  email?: string;
  discordUsername?: string | null;
  discourseUsername?: string | null;
}

export async function updateUserAccount({
  userId,
  name,
  email,
  discordUsername,
  discourseUsername,
}: UpdateAccountData) {
  const updateData: Partial<typeof users.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (name !== undefined) {
    updateData.name = name;
  }
  if (email !== undefined) {
    updateData.email = email;
  }

  if (discordUsername !== undefined) {
    if (typeof discordUsername === 'string' && discordUsername.length > 0) {
      if (!discordUsernameRegex.test(discordUsername)) {
        throw new Error('Invalid Discord username format');
      }
      updateData.discordUsername = discordUsername;
    }
  }

  if (discourseUsername !== undefined) {
    const discourseUpdate = await resolveDiscourseUpdate(
      userId,
      discourseUsername
    );
    if (discourseUpdate) {
      Object.assign(updateData, discourseUpdate);
    }
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));
}

async function resolveDiscourseUpdate(
  userId: string,
  nextDiscourse: string | null
): Promise<
  | Pick<typeof users.$inferInsert, 'discourseUsername' | 'infiniteFlightId'>
  | undefined
> {
  if (nextDiscourse === null || nextDiscourse === '') {
    return { discourseUsername: null, infiniteFlightId: null };
  }

  const trimmed = nextDiscourse.trim();

  const current = await db
    .select({
      discourseUsername: users.discourseUsername,
      infiniteFlightId: users.infiniteFlightId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (current?.discourseUsername === trimmed) {
    return undefined;
  }

  try {
    const ifUser = await getIFUserByDiscourseUsername(trimmed);
    return {
      discourseUsername: trimmed,
      infiniteFlightId: ifUser ? ifUser.userId : null,
    };
  } catch {
    throw new Error('Invalid Discourse username format');
  }
}
