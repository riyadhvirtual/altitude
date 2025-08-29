import { eq, like } from 'drizzle-orm';
import { createInterface } from 'readline/promises';

import { db } from '@/db';
import { users } from '@/db/schema';
import type { User } from '@/db/schema';
import { ADMIN_ROLE, OWNER_ROLE, stringifyRoles } from '@/lib/roles';
import { logger } from '@/lib/logger';

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(question);
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  return result ?? null;
}

async function confirm(question: string): Promise<boolean> {
  const answer = (await prompt(`${question} (y/N): `)).toLowerCase();
  return ['y', 'yes'].includes(answer);
}

async function promoteToOwner(target: User): Promise<void> {
  const now = new Date();
  await db
    .update(users)
    .set({
      role: stringifyRoles([OWNER_ROLE]),
      updatedAt: now,
      // Keep current verified state as-is to avoid unintended side effects
    })
    .where(eq(users.id, target.id));
}

async function demoteExistingOwners(exceptId: string): Promise<number> {
  // Find users whose role field contains 'owner' (stringified form may vary)
  const owners = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(like(users.role, '%owner%'));

  const others = owners.filter((u) => u.id !== exceptId);
  if (others.length === 0) return 0;

  const now = new Date();
  for (const u of others) {
    await db
      .update(users)
      .set({ role: stringifyRoles([ADMIN_ROLE]), updatedAt: now })
      .where(eq(users.id, u.id));
  }
  return others.length;
}

async function main() {
  logger.info('🛠️  Make Owner utility');
  logger.info('Provide the user email to promote.');

  const input = await prompt('User email: ');
  if (!input || !input.includes('@')) {
    logger.error('No input provided. Aborting.');
    process.exit(1);
  }

  const user = await findUserByEmail(input);
  if (!user) {
    logger.error('User not found.');
    process.exit(1);
  }

  const summary =
    `${user.name ?? 'Unknown'} <${user.email ?? 'no-email'}> ` +
    `(callsign: ${user.callsign ?? 'N/A'}, discord: ${user.discordUsername})`;
  logger.info(`Found user: ${summary}`);

  const proceed = await confirm('Promote this user to OWNER (exclusive)?');
  if (!proceed) {
    logger.info('Aborted by user.');
    process.exit(0);
  }

  await promoteToOwner(user);
  logger.info('✅ Promoted to OWNER.');

  // Check if other owners exist and offer to demote to admin
  const hasOthers = await confirm('Demote any other existing owners to ADMIN?');
  if (hasOthers) {
    const count = await demoteExistingOwners(user.id);
    if (count > 0) {
      logger.info(`✅ Demoted ${count} other owner(s) to ADMIN.`);
    } else {
      logger.info('No other owners found.');
    }
  } else {
    logger.warn(
      'There may be multiple owners remaining. You can re-run this script to demote them.'
    );
  }

  logger.info('🎉 Done.');
}

main().catch((err: unknown) => {
  logger.error({ error: err }, '❌ Failed to promote user to owner');
  process.exit(1);
});
