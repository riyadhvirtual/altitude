'use server';

import { revalidatePath } from 'next/cache';

import {
  denyApplication,
  DenyApplicationSchema,
} from '@/domains/users/deny-application';
import { handleDbError } from '@/lib/db-error';
import { createRoleActionClient } from '@/lib/safe-action';

export const denyApplicationAction = createRoleActionClient(['users'])
  .inputSchema(DenyApplicationSchema)
  .action(async ({ parsedInput: { userId }, ctx }) => {
    try {
      await denyApplication(userId, ctx.userRoles);

      revalidatePath('/admin/users');
      revalidatePath(`/admin/users/${userId}`);

      return {
        success: true,
        message: 'Application denied and user deleted.',
      };
    } catch (error) {
      handleDbError(error, {
        fallback: 'Failed to deny application',
      });
    }
  });
