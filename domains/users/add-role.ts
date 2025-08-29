import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import {
  type AssignableRole,
  parseRolesField,
  stringifyRoles,
} from '@/lib/roles';

interface AddRoleData {
  userId: string;
  role: AssignableRole;
}

export async function addRole({ userId, role }: AddRoleData) {
  const current = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!current) {
    throw new Error('User not found');
  }

  const currentRoles = parseRolesField(current.role);

  if (currentRoles.includes(role)) {
    return { message: 'Role already assigned', roles: currentRoles };
  }

  const updatedRoles = [...currentRoles, role];

  await db
    .update(users)
    .set({
      role: stringifyRoles(updatedRoles),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { message: 'Role added successfully', roles: updatedRoles };
}
