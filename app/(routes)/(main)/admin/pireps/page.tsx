import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth-check';

export default async function PirepsPage() {
  await requireRole(['pireps']);

  redirect('/admin/pireps/status/pending');
}
