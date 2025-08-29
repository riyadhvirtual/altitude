import type { User } from 'discord.js';
import { eq, like, or } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';

export async function findUserByDiscord(discordUser: User) {
  return await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.discordUsername, discordUser.username),
        eq(users.discordUsername, discordUser.id)
      )
    )
    .get();
}

export async function findUserByDiscordUsername(username: string) {
  return await db
    .select()
    .from(users)
    .where(like(users.discordUsername, `%${username}%`))
    .get();
}

export async function findUserByDiscordOrUsername(
  discordUser?: User,
  usernameSearch?: string,
  fallbackUsername?: string
) {
  if (discordUser) {
    return await findUserByDiscord(discordUser);
  }

  if (usernameSearch) {
    return await findUserByDiscordUsername(usernameSearch);
  }

  if (fallbackUsername) {
    return await findUserByDiscordUsername(fallbackUsername);
  }

  return null;
}
