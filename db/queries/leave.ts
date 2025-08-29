import { and, desc, eq, or, sql } from 'drizzle-orm';

import { db } from '@/db';
import { type LeaveRequest, leaveRequests, users } from '@/db/schema';

type LeaveRequestWithUser = LeaveRequest & {
  user: {
    id: string;
    name: string;
    email: string;
    callsign: number | null;
    image: string | null;
  };
};

async function getLeaveRequestsPaginated(
  page: number,
  limit: number,
  search?: string
): Promise<{ leaveRequests: LeaveRequestWithUser[]; total: number }> {
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? sql<boolean>`(
        ${leaveRequests.reason} LIKE ${`%${search}%`} COLLATE NOCASE 
        OR ${leaveRequests.status} LIKE ${`%${search}%`} COLLATE NOCASE
      )`
    : sql<boolean>`1 = 1`;

  const result = await db
    .select({
      id: leaveRequests.id,
      userId: leaveRequests.userId,
      reason: leaveRequests.reason,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        callsign: users.callsign,
        image: users.image,
      },
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(leaveRequests)
    .leftJoin(users, eq(leaveRequests.userId, users.id))
    .where(searchCondition)
    .orderBy(desc(leaveRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    leaveRequests: result.map(
      ({ totalCount: _totalCount, ...leaveRequest }) => leaveRequest
    ) as LeaveRequestWithUser[],
    total: result[0]?.totalCount ?? 0,
  };
}

async function getLeaveRequestsPaginatedForUser(
  userId: string,
  page: number,
  limit: number,
  search?: string
): Promise<{ leaveRequests: LeaveRequestWithUser[]; total: number }> {
  const offset = (page - 1) * limit;

  const searchCondition = search
    ? sql<boolean>`(
        ${leaveRequests.userId} = ${userId} 
        AND (
          ${leaveRequests.reason} LIKE ${`%${search}%`} COLLATE NOCASE 
          OR ${leaveRequests.status} LIKE ${`%${search}%`} COLLATE NOCASE
        )
      )`
    : sql<boolean>`${leaveRequests.userId} = ${userId}`;

  const result = await db
    .select({
      id: leaveRequests.id,
      userId: leaveRequests.userId,
      reason: leaveRequests.reason,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        callsign: users.callsign,
        image: users.image,
      },
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(leaveRequests)
    .leftJoin(users, eq(leaveRequests.userId, users.id))
    .where(searchCondition)
    .orderBy(desc(leaveRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    leaveRequests: result.map(
      ({ totalCount: _totalCount, ...leaveRequest }) => leaveRequest
    ) as LeaveRequestWithUser[],
    total: result[0]?.totalCount ?? 0,
  };
}

async function getLeaveRequestById(
  id: string
): Promise<LeaveRequestWithUser | null> {
  const result = await db
    .select({
      id: leaveRequests.id,
      userId: leaveRequests.userId,
      reason: leaveRequests.reason,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        callsign: users.callsign,
        image: users.image,
      },
    })
    .from(leaveRequests)
    .leftJoin(users, eq(leaveRequests.userId, users.id))
    .where(eq(leaveRequests.id, id))
    .get();

  return (result as LeaveRequestWithUser | null) ?? null;
}

export {
  getLeaveRequestById,
  getLeaveRequestsPaginated,
  getLeaveRequestsPaginatedForUser,
};

type LeaveCategory = 'pending' | 'active' | 'archive';

async function getLeaveRequestsPaginatedByCategory(
  page: number,
  limit: number,
  category: LeaveCategory,
  search?: string
): Promise<{ leaveRequests: LeaveRequestWithUser[]; total: number }> {
  const offset = (page - 1) * limit;
  const now = new Date();

  // Base search condition
  const searchCondition = search
    ? sql<boolean>`(
        ${leaveRequests.reason} LIKE ${`%${search}%`} COLLATE NOCASE 
        OR ${leaveRequests.status} LIKE ${`%${search}%`} COLLATE NOCASE
      )`
    : sql<boolean>`1 = 1`;

  // Category conditions
  const categoryCondition =
    category === 'pending'
      ? eq(leaveRequests.status, 'pending')
      : category === 'active'
        ? and(
            eq(leaveRequests.status, 'approved'),
            sql<boolean>`${leaveRequests.startDate} <= ${now}`,
            sql<boolean>`${leaveRequests.endDate} >= ${now}`
          )
        : // archive
          or(
            eq(leaveRequests.status, 'denied'),
            and(
              eq(leaveRequests.status, 'approved'),
              sql<boolean>`${leaveRequests.endDate} < ${now}`
            )
          );

  const result = await db
    .select({
      id: leaveRequests.id,
      userId: leaveRequests.userId,
      reason: leaveRequests.reason,
      startDate: leaveRequests.startDate,
      endDate: leaveRequests.endDate,
      status: leaveRequests.status,
      createdAt: leaveRequests.createdAt,
      updatedAt: leaveRequests.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        callsign: users.callsign,
        image: users.image,
      },
      totalCount: sql<number>`COUNT(*) OVER()`.as('totalCount'),
    })
    .from(leaveRequests)
    .leftJoin(users, eq(leaveRequests.userId, users.id))
    .where(and(searchCondition, categoryCondition))
    .orderBy(desc(leaveRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    leaveRequests: result.map(
      ({ totalCount: _totalCount, ...leaveRequest }) => leaveRequest
    ) as LeaveRequestWithUser[],
    total: result[0]?.totalCount ?? 0,
  };
}

export type { LeaveCategory, LeaveRequestWithUser };
export { getLeaveRequestsPaginatedByCategory };
