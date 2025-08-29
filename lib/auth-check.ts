import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { users } from '@/db/schema';
import { hasRequiredRole, normalizeRoles } from '@/lib/roles';

import { auth } from './auth';

export async function authCheck() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  if (!session.user.verified) {
    redirect('/login?reason=unverified');
  }

  // Check if user is banned using session data
  if (session.user.banned) {
    // Check if ban has expired
    if (
      session.user.banExpires &&
      new Date(session.user.banExpires) < new Date()
    ) {
      // Ban has expired, unban the user
      await db
        .update(users)
        .set({
          banned: false,
          bannedReason: null,
          banExpires: null,
        })
        .where(eq(users.id, session.user.id));
    } else {
      // User is still banned
      redirect('/login?reason=banned');
    }
  }

  return session;
}

export async function requireAuth(): Promise<void> {
  await authCheck();
}

export async function requireRole(
  requiredRoles: string[],
  redirectTo = '/dashboard'
) {
  const session = await authCheck();
  const hasAccess = await requireRoleByUserId(session.user.id, requiredRoles);

  if (!hasAccess) {
    redirect(redirectTo);
  }
  return session;
}

export async function requireAdmin(redirectTo = '/dashboard') {
  return await requireRole(['admin'], redirectTo);
}

export async function checkRole(requiredRoles: string[]) {
  const session = await authCheck();

  const hasAccess = await requireRoleByUserId(session.user.id, requiredRoles);

  return {
    session,
    hasAccess,
  };
}

export async function getCurrentUserRoles(): Promise<string[]> {
  try {
    const session = await authCheck();
    return await getUserRoles(session.user.id);
  } catch {
    // If auth fails (redirect), return empty array
    return [];
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const roles = await getCurrentUserRoles();
    return roles.includes('admin') || roles.includes('owner');
  } catch {
    return false;
  }
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const normalizedRoles = normalizeRoles(user?.role || null);

  return normalizedRoles;
}

export async function requireRoleByUserId(
  userId: string,
  requiredRoles: string[]
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);

  const hasAccess = hasRequiredRole(userRoles, requiredRoles);

  return hasAccess;
}
