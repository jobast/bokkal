'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to verify current user is admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, userId: null };

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const userData = data as { is_admin?: boolean } | null;
  return { isAdmin: userData?.is_admin || false, userId: user.id };
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const { isAdmin: currentUserIsAdmin, userId: currentUserId } = await verifyAdmin();

  if (!currentUserIsAdmin) {
    return { error: 'Accès admin requis' };
  }

  // Prevent removing own admin status
  if (currentUserId === userId && !isAdmin) {
    return { error: 'Vous ne pouvez pas retirer votre propre statut admin' };
  }

  const supabase = await createClient();
  const { error } = await (supabase
    .from('users') as ReturnType<typeof supabase.from>)
    .update({ is_admin: isAdmin } as never)
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');

  return { error: null };
}

export async function toggleUserVerified(userId: string, isVerified: boolean) {
  const { isAdmin } = await verifyAdmin();

  if (!isAdmin) {
    return { error: 'Accès admin requis' };
  }

  const supabase = await createClient();
  const { error } = await (supabase
    .from('users') as ReturnType<typeof supabase.from>)
    .update({ is_verified: isVerified } as never)
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/users');

  return { error: null };
}

export async function getCurrentUserAdminStatus() {
  const { isAdmin } = await verifyAdmin();
  return { isAdmin };
}
