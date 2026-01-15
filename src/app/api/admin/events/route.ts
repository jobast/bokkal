import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkIsAdmin } from '@/lib/admin/queries';

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
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Build query
  let query = supabase
    .from('events')
    .select('*, user:users(id, full_name, is_verified, is_admin)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
