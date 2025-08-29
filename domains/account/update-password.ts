import { auth } from '@/lib/auth';

interface UpdatePasswordData {
  userId: string;
  password: string;
  confirmPassword: string;
}

/**
 * When a user wants to update its own password, only works from the current user
 */
export async function updatePassword({
  userId,
  password,
  confirmPassword,
}: UpdatePasswordData) {
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const authCtx = await auth.$context;
  const hash = await authCtx.password.hash(password);

  await authCtx.internalAdapter.updatePassword(userId, hash);
}
