import { auth } from '@/lib/auth';
import { generateSecurePassword } from '@/lib/utils';

export async function resetUserPassword(userId: string): Promise<string> {
  const ctx = await auth.$context;

  const tempPassword = generateSecurePassword();

  const hash = await ctx.password.hash(tempPassword);

  await ctx.internalAdapter.updatePassword(userId, hash);

  return tempPassword;
}
