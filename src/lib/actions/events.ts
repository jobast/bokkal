'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateEventInput, EventStatus } from '@/types';

// Helper to map category to legacy event_type for backward compatibility
function mapCategoryToEventType(category: string): string {
  const mapping: Record<string, string> = {
    musique_fete: 'concert',
    culture_arts: 'culture',
    sport_bienetre: 'sport',
    marches_food: 'marche',
    ateliers_rencontres: 'atelier',
    communaute: 'autre',
  };
  return mapping[category] || 'autre';
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Vous devez être connecté pour créer un événement', data: null };
  }

  // Check user status for auto-approval
  const { data: userStatusData } = await supabase
    .from('users')
    .select('is_admin, is_verified')
    .eq('id', user.id)
    .single();

  const userData = userStatusData as { is_admin?: boolean; is_verified?: boolean } | null;

  // Determine initial status based on user type
  const initialStatus: EventStatus =
    (userData?.is_admin || userData?.is_verified) ? 'approved' : 'pending';

  // Insert event
  const { data, error } = await (supabase
    .from('events') as ReturnType<typeof supabase.from>)
    .insert({
      user_id: user.id,
      title: input.title,
      title_en: input.title_en || null,
      title_wo: input.title_wo || null,
      description: input.description,
      description_en: input.description_en || null,
      description_wo: input.description_wo || null,
      event_type: input.event_type || mapCategoryToEventType(input.category),
      category: input.category,
      subcategory: input.subcategory,
      tags: input.tags || null,
      location_name: input.location_name,
      location_city: input.location_city,
      location_lat: input.location_lat || null,
      location_lng: input.location_lng || null,
      start_date: input.start_date,
      end_date: input.end_date || null,
      price: input.price || null,
      target_audience: input.target_audience || null,
      contact_phone: input.contact_phone || null,
      contact_email: input.contact_email || null,
      contact_whatsapp: input.contact_whatsapp || null,
      image_url: input.image_url || null,
      status: initialStatus,
    } as never)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath('/events');
  revalidatePath('/admin/events');

  return { error: null, data };
}

export async function updateEvent(id: string, input: Partial<CreateEventInput>) {
  const supabase = await createClient();

  const { data, error } = await (supabase
    .from('events') as ReturnType<typeof supabase.from>)
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  revalidatePath('/events');
  revalidatePath(`/events/${id}`);
  revalidatePath('/admin/events');

  return { error: null, data };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  // Verify user owns the event or is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non autorisé' };
  }

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const { data: eventDataRaw } = await supabase
    .from('events')
    .select('user_id')
    .eq('id', id)
    .single();

  const userData = userDataRaw as { is_admin?: boolean } | null;
  const eventData = eventDataRaw as { user_id?: string } | null;

  if (!userData?.is_admin && eventData?.user_id !== user.id) {
    return { error: 'Non autorisé à supprimer cet événement' };
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/admin/events');

  return { error: null };
}

export async function approveEvent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non autorisé' };
  }

  // Verify admin status
  const { data: adminCheckRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const adminCheck = adminCheckRaw as { is_admin?: boolean } | null;

  if (!adminCheck?.is_admin) {
    return { error: 'Accès admin requis' };
  }

  const { error } = await (supabase
    .from('events') as ReturnType<typeof supabase.from>)
    .update({
      status: 'approved',
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    } as never)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/admin/events');

  return { error: null };
}

export async function rejectEvent(id: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non autorisé' };
  }

  // Verify admin status
  const { data: adminCheckRaw } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const adminCheck = adminCheckRaw as { is_admin?: boolean } | null;

  if (!adminCheck?.is_admin) {
    return { error: 'Accès admin requis' };
  }

  const { error } = await (supabase
    .from('events') as ReturnType<typeof supabase.from>)
    .update({
      status: 'rejected',
      rejection_reason: reason || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    } as never)
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/events');
  revalidatePath('/admin/events');

  return { error: null };
}

export async function getEventById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*, user:users(id, full_name, is_verified)')
    .eq('id', id)
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}

export async function getEvents(filters?: {
  status?: EventStatus;
  category?: string;
  city?: string;
  userId?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select('*, user:users(id, full_name, is_verified)')
    .order('start_date', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.city) {
    query = query.eq('location_city', filters.city);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  return { error: null, data };
}
