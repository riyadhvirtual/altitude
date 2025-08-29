'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/db';
import { users } from '@/db/schema';
import {
  adminAssignGateToParticipantRecord,
  assignGateToParticipant,
} from '@/domains/events/join-event';
import { handleDbError } from '@/lib/db-error';
import { hasRequiredRole, parseRolesField } from '@/lib/roles';
import { authActionClient } from '@/lib/safe-action';

const assignGateSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  gateId: z.string().min(1, 'Gate ID is required'),
  gateType: z.enum(['departure', 'arrival']),
  userIdOverride: z.string().optional(),
});

export const assignGateAction = authActionClient
  .inputSchema(assignGateSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const participant = parsedInput.userIdOverride
        ? await (async () => {
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

            return adminAssignGateToParticipantRecord({
              eventId: parsedInput.eventId,
              gateId: parsedInput.gateId,
              gateType: parsedInput.gateType,
              targetUserId: parsedInput.userIdOverride!,
            });
          })()
        : await assignGateToParticipant(parsedInput, ctx.userId);

      revalidatePath('/events');
      revalidatePath(`/events/${parsedInput.eventId}`);
      revalidatePath(`/admin/events/${parsedInput.eventId}`);

      return {
        success: true,
        message: 'Gate assigned successfully',
        participant,
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to assign gate',
      });
    }
  });
