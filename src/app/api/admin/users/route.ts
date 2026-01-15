import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkIsAdmin } from '@/lib/admin/queries';
import type { User } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Check admin
  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });
  }

  // Parse query params
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  const isAdminFilter = searchParams.get('isAdmin');
  const isVerified = searchParams.get('isVerified');

  // Build users query
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }
  if (isAdminFilter !== null && isAdminFilter !== '') {
    query = query.eq('is_admin', isAdminFilter === 'true');
  }
  if (isVerified !== null && isVerified !== '') {
    query = query.eq('is_verified', isVerified === 'true');
  }

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Erreur' }, { status: 500 });
  }

  const users = data as User[];

  // Get event counts for each user
  const userIds = users.map((u) => u.id);

  if (userIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data: eventsData } = await supabase
    .from('events')
    .select('user_id')
    .in('user_id', userIds);

  const events = (eventsData || []) as { user_id: string }[];

  // Count events per user
  const countMap: Record<string, number> = {};
  events.forEach((e) => {
    countMap[e.user_id] = (countMap[e.user_id] || 0) + 1;
  });

  // Merge counts
  const usersWithCounts = users.map((user) => ({
    ...user,
    events_count: countMap[user.id] || 0,
  }));

  return NextResponse.json({ data: usersWithCounts });
}
