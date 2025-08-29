import { eq, inArray } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import {
  ADMIN_ROLE,
  OWNER_ROLE,
  parseRolesField,
  stringifyRoles,
} from '@/lib/roles';

interface TransferOwnershipData {
  newOwnerId: string;
  previousOwner: string;
}

export async function transferOwnership({
  newOwnerId,
  previousOwner,
}: TransferOwnershipData) {
  if (previousOwner === newOwnerId) {
    throw new Error('You cannot transfer ownership to yourself');
  }

  await db.transaction(async (tx) => {
    const userResults = await tx
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(inArray(users.id, [newOwnerId, previousOwner]));

    if (userResults.length !== 2) {
      const foundIds = userResults.map((u) => u.id);
      const missingUser = !foundIds.includes(newOwnerId)
        ? 'New owner'
        : 'Previous owner';
      throw new Error(`${missingUser} not found`);
    }

    // Verify the caller (previous owner) is actually the current owner
    const prevOwnerRecord = userResults.find((u) => u.id === previousOwner);
    if (!prevOwnerRecord) {
      throw new Error('Previous owner not found');
    }
    const prevOwnerRoles = parseRolesField(prevOwnerRecord.role);
    if (!prevOwnerRoles.includes(OWNER_ROLE)) {
      throw new Error('Only the owner can transfer ownership');
    }

    const now = new Date();
    const updatedNewOwnerRoles = stringifyRoles([OWNER_ROLE]);
    const updatedPrevOwnerRoles = stringifyRoles([ADMIN_ROLE]);

    await Promise.all([
      tx
        .update(users)
        .set({
          role: updatedNewOwnerRoles,
          updatedAt: now,
        })
        .where(eq(users.id, newOwnerId)),

      tx
        .update(users)
        .set({
          role: updatedPrevOwnerRoles,
          updatedAt: now,
        })
        .where(eq(users.id, previousOwner)),
    ]);
  });
}
