'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PirepsStatusTabsProps {
  currentStatus: 'pending' | 'approved' | 'denied';
}

export function PirepsStatusTabs({ currentStatus }: PirepsStatusTabsProps) {
  return (
    <Tabs value={currentStatus} className="w-full mb-6">
      <TabsList className="mb-4">
        <TabsTrigger
          value="pending"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/admin/pireps/status/pending">
            <Clock className="h-4 w-4 text-yellow-800" />
            Pending
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="approved"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/admin/pireps/status/approved">
            <CheckCircle className="h-4 w-4 text-green-800" />
            Approved
          </Link>
        </TabsTrigger>
        <TabsTrigger value="denied" asChild className="flex items-center gap-2">
          <Link href="/admin/pireps/status/denied">
            <XCircle className="h-4 w-4 text-red-800" />
            Denied
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
