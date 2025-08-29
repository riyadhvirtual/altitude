'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
  getPirepEventsWithAirline,
  resolveAircraftNames,
  resolveMultiplierNames,
} from '@/db/queries/pireps';
import { pireps } from '@/db/schema';
import { handleDbError } from '@/lib/db-error';
import { hasRequiredRole, parseRolesField } from '@/lib/roles';
import { authActionClient } from '@/lib/safe-action';

const getPirepEventsSchema = z.object({
  id: z.string().min(1, 'PIREP id is required'),
});

export const getPirepEventsAction = authActionClient
  .inputSchema(getPirepEventsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id: pirepId } = parsedInput;

    try {
      // Determine if user has access: admin/pireps role or owns the PIREP
      const roles = parseRolesField(ctx.session.user.role);
      const hasPirepsRole = hasRequiredRole(roles, ['pireps']);

      let allowed = hasPirepsRole;
      if (!allowed) {
        const owner = await db
          .select({ userId: pireps.userId })
          .from(pireps)
          .where(eq(pireps.id, pirepId))
          .get();
        allowed = owner?.userId === ctx.userId;
      }

      if (!allowed) {
        throw new Error('Access denied');
      }

      const { events, airlineCallsign } =
        await getPirepEventsWithAirline(pirepId);

      // Extract all unique aircraft IDs and multiplier IDs from previous/new values
      const aircraftIds = new Set<string>();
      const multiplierIds = new Set<string>();

      for (const event of events) {
        if (event.previousValues) {
          try {
            const prev = JSON.parse(event.previousValues);
            if (prev.aircraftId) {
              aircraftIds.add(prev.aircraftId);
            }
            if (prev.multiplierId) {
              multiplierIds.add(prev.multiplierId);
            }
          } catch {
            // Ignore parse errors
          }
        }
        if (event.newValues) {
          try {
            const next = JSON.parse(event.newValues);
            if (next.aircraftId) {
              aircraftIds.add(next.aircraftId);
            }
            if (next.multiplierId) {
              multiplierIds.add(next.multiplierId);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      const aircraftNames = await resolveAircraftNames(Array.from(aircraftIds));
      const multiplierNames = await resolveMultiplierNames(
        Array.from(multiplierIds)
      );

      return { events, airlineCallsign, aircraftNames, multiplierNames };
    } catch (error) {
      handleDbError(error, { fallback: 'Failed to load PIREP history' });
    }
  });
