import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hasRequiredRole, OWNER_ROLE, parseRolesField } from '@/lib/roles';

export const actionClient = createSafeActionClient().use(async ({ next }) => {
  return next({ ctx: {} });
});

export const authActionClient = createSafeActionClient()
  .use(async ({ next }) => {
    const { auth } = await import('@/lib/auth');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error('Authentication required');
    }

    return next({ ctx: { userId: session.user.id, session } });
  })
  .use(async ({ next, ctx }) => {
    return next({ ctx });
  });

/**
 * Creates a role-based action client that checks if the user has the required roles
 * before executing the action
 */
export const createRoleActionClient = (requiredRoles: string[]) => {
  return authActionClient.use(async ({ next, ctx }) => {
    const user = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .get();

    if (!user) {
      throw new Error('User not found');
    }

    const userRoles = parseRolesField(user.role);
    const hasAccess = hasRequiredRole(userRoles, requiredRoles);

    if (!hasAccess) {
      throw new Error(
        `Access denied. Required roles: ${requiredRoles.join(' or ')}`
      );
    }

    return next({ ctx: { ...ctx, userRoles } });
  });
};

/**
 * Owner-only action client, admins cannot bypass this check
 */
export const ownerActionClient = authActionClient.use(async ({ next, ctx }) => {
  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, ctx.userId))
    .get();

  if (!user) {
    throw new Error('User not found');
  }

  const userRoles = parseRolesField(user.role);
  const isOwner = userRoles.includes(OWNER_ROLE);

  if (!isOwner) {
    throw new Error('Only the owner can perform this action');
  }

  return next({ ctx: { ...ctx, userRoles } });
});
