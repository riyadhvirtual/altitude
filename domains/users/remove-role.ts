import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { OWNER_ROLE, parseRolesField, stringifyRoles } from '@/lib/roles';

interface RemoveRoleData {
  userId: string;
  role: string;
}

export async function removeRole({ userId, role }: RemoveRoleData) {
  if (role === OWNER_ROLE) {
    throw new Error('Cannot remove owner role');
  }
  const current = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!current) {
    throw new Error('User not found');
  }

  const currentRoles = parseRolesField(current.role);
  if (!currentRoles.includes(role)) {
    return { message: 'Role already removed', roles: currentRoles };
  }

  const updatedRoles = currentRoles.filter((r) => r !== role);

  await db
    .update(users)
    .set({ role: stringifyRoles(updatedRoles), updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { message: 'Role removed successfully', roles: updatedRoles };
}
