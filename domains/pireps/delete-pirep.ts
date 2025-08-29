import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { pireps } from '@/db/schema';
import { hasRequiredRole, parseRolesField } from '@/lib/roles';

export async function deletePirep(
  id: string,
  userId: string,
  userRolesRaw: string
): Promise<void> {
  const pirep = await db
    .select({
      id: pireps.id,
      status: pireps.status,
      userId: pireps.userId,
    })
    .from(pireps)
    .where(eq(pireps.id, id))
    .get();

  if (!pirep) {
    throw new Error('PIREP not found');
  }

  const userRoles = parseRolesField(userRolesRaw);
  const hasPirepsRole = hasRequiredRole(userRoles, ['pireps']);

  if (pirep.status === 'pending') {
    const isOwnPirep = pirep.userId === userId;
    if (!isOwnPirep && !hasPirepsRole) {
      throw new Error(
        'Access denied. You can only delete your own pending PIREPs or need the pireps role'
      );
    }
  } else {
    if (!hasPirepsRole) {
      throw new Error(
        'Access denied. Only users with the pireps role can delete non-pending PIREPs'
      );
    }
  }

  const result = await db.delete(pireps).where(eq(pireps.id, id));

  if (result.rowsAffected === 0) {
    throw new Error('Failed to delete PIREP - no changes made');
  }
}
