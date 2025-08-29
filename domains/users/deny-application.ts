import { z } from 'zod';

import { kickUser } from '@/domains/users/kick-user';

export const DenyApplicationSchema = z.object({
  userId: z.string(),
});

export async function denyApplication(userId: string, actorRoles: string[]) {
  await kickUser(userId, actorRoles);
}
