import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { LeaveRequest, User } from '@/db/schema';

interface LeaveDetailsProps {
  leaveRequest: LeaveRequest & { user?: Partial<User> | null };
  isAdmin?: boolean;
  adminActionButtons?: ReactNode;
  backHref: string;
  backLabel: string;
}

function formatDateRange(startDate: Date, endDate: Date) {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const end = new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return `${start} - ${end}`;
}

function calculateDuration(startDate: Date, endDate: Date) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function LeaveDetails({
  leaveRequest,
  isAdmin = false,
  adminActionButtons,
  backHref,
  backLabel,
}: LeaveDetailsProps) {
  return (
    <div className="space-y-4">
      <Button asChild className="mb-2" size="sm" variant="outline">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-2">
        <div className="space-y-1">
          <h4 className="whitespace-nowrap text-4xl text-foreground mb-4">
            Leave Request Details
            {isAdmin && leaveRequest.user && leaveRequest.user.name ? (
              <>
                {' - Filed by '}
                <Link
                  href={`/admin/users/${leaveRequest.userId}`}
                  className="font-bold hover:underline"
                >
                  {leaveRequest.user.name}
                </Link>
              </>
            ) : null}
          </h4>
        </div>
        {isAdmin && adminActionButtons}
      </div>

      <div className="space-y-6">
        <Card className="border-0 bg-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Date Range:
              </span>
              <p className="text-foreground">
                {formatDateRange(leaveRequest.startDate, leaveRequest.endDate)}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Duration:
              </span>
              <p className="text-foreground">
                {calculateDuration(
                  leaveRequest.startDate,
                  leaveRequest.endDate
                )}{' '}
                days
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Status:
              </span>
              <div className="mt-1">
                <StatusBadge status={leaveRequest.status} />
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Submitted:
              </span>
              <p className="text-foreground">
                {new Date(leaveRequest.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reason for Leave
            </CardTitle>
            <CardDescription>Full details of the leave request</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">
                {leaveRequest.reason}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
