'use client';

import { CheckCircle, Clock, Inbox } from 'lucide-react';
import Link from 'next/link';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaveStatusTabsProps {
  current: 'pending' | 'active' | 'archive';
}

export function LeaveStatusTabs({ current }: LeaveStatusTabsProps) {
  return (
    <Tabs value={current} className="w-full mb-2">
      <TabsList>
        <TabsTrigger
          value="pending"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/admin/leave/status/pending">
            <Clock className="h-4 w-4 text-yellow-800" />
            Pending
          </Link>
        </TabsTrigger>
        <TabsTrigger value="active" asChild className="flex items-center gap-2">
          <Link href="/admin/leave/status/active">
            <CheckCircle className="h-4 w-4 text-green-800" />
            Active
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="archive"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/admin/leave/status/archive">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            Archive
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
