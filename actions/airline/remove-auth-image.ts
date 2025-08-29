'use server';

import { revalidatePath } from 'next/cache';

import { removeAuthBranding } from '@/domains/airline/upload-auth-image';
import { createRoleActionClient } from '@/lib/safe-action';

export const removeAuthBrandingAction = createRoleActionClient([
  'admin',
]).action(async () => {
  await removeAuthBranding();

  revalidatePath('/admin/settings');
  revalidatePath('/login');
  revalidatePath('/signup');

  return {
    success: true,
    message: 'Auth background removed',
  } as const;
});
