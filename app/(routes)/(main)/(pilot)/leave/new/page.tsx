import type { Metadata } from 'next';

import { LeaveRequestForm } from '@/components/leave/leave-form';
import { requireAuth } from '@/lib/auth-check';

export function generateMetadata(): Metadata {
  return {
    title: 'Request Leave',
  };
}

export default async function NewLeaveRequestPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="space-y-1 w-full md:w-auto">
          <h3 className="font-medium text-2xl md:text-3xl text-foreground break-normal">
            Request Leave
          </h3>
          <p className="text-muted-foreground">
            Submit a new leave request for time off
          </p>
        </div>
      </div>
      <LeaveRequestForm />
    </div>
  );
}
