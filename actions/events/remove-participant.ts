'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/db';
import { users } from '@/db/schema';
import { adminRemoveParticipantFromEventRecord } from '@/domains/events/join-event';
import { handleDbError } from '@/lib/db-error';
import { hasRequiredRole, parseRolesField } from '@/lib/roles';
import { authActionClient } from '@/lib/safe-action';

const removeParticipantSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  targetUserId: z.string().min(1, 'User ID is required'),
});

export const removeParticipantAction = authActionClient
  .inputSchema(removeParticipantSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const current = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, ctx.userId))
        .get();

      const userRoles = parseRolesField(current?.role ?? null);
      const allowed = hasRequiredRole(userRoles, ['events']);
      if (!allowed) {
        throw new Error('Access denied. Required role: events');
      }

      await adminRemoveParticipantFromEventRecord(parsedInput);

      revalidatePath('/events');
      revalidatePath(`/events/${parsedInput.eventId}`);
      revalidatePath(`/admin/events/${parsedInput.eventId}`);

      return {
        success: true,
        message: 'Participant removed from event',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to remove participant',
      });
    }
  });
