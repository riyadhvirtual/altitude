import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth-check';

export default async function LeavePage() {
  await requireRole(['users']);
  redirect('/admin/leave/status/pending');
}
