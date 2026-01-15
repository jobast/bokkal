import { createClient } from '@/lib/supabase/server';
import type { EventStatus, User } from '@/types';

export async function getAdminStats() {
  const supabase = await createClient();

  const [eventsResult, pendingResult, usersResult, verifiedResult] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
  ]);

  return {
    totalEvents: eventsResult.count || 0,
    pendingEvents: pendingResult.count || 0,
    totalUsers: usersResult.count || 0,
    verifiedUsers: verifiedResult.count || 0,
  };
}

export async function getAdminEvents(filters: {
  status?: EventStatus;
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const { status, category, city, search, page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from('events')
    .select('*, user:users(id, full_name, email, is_verified, is_admin)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (city) query = query.eq('location_city', city);
  if (search) query = query.ilike('title', `%${search}%`);

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  return {
    data,
    error: error?.message || null,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getAdminUsers(filters: {
  search?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const { search, isAdmin, isVerified, page = 1, pageSize = 20 } = filters;

  // First get users
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%`);
  }
  if (isAdmin !== undefined) query = query.eq('is_admin', isAdmin);
  if (isVerified !== undefined) query = query.eq('is_verified', isVerified);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: usersRaw, error, count } = await query;

  if (error || !usersRaw) {
    return {
      data: null,
      error: error?.message || null,
      count: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const users = usersRaw as User[];

  // Get event counts for each user
  const userIds = users.map((u) => u.id);
  const { data: eventCountsRaw } = await supabase
    .from('events')
    .select('user_id')
    .in('user_id', userIds);

  const eventCounts = eventCountsRaw as { user_id: string }[] | null;

  // Count events per user
  const countMap: Record<string, number> = {};
  eventCounts?.forEach((e) => {
    countMap[e.user_id] = (countMap[e.user_id] || 0) + 1;
  });

  // Merge counts into users
  const usersWithCounts = users.map((user) => ({
    ...user,
    events_count: countMap[user.id] || 0,
  }));

  return {
    data: usersWithCounts,
    error: null,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserWithEvents(userId: string) {
  const supabase = await createClient();

  const [userResult, eventsResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  return {
    user: userResult.data,
    events: eventsResult.data || [],
    error: userResult.error?.message || eventsResult.error?.message || null,
  };
}

export async function checkIsAdmin(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  const userData = data as { is_admin?: boolean } | null;
  return userData?.is_admin || false;
}
