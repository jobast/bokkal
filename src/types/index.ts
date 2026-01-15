// Legacy event types (kept for backward compatibility)
export type EventType =
  | 'concert'
  | 'soiree'
  | 'culture'
  | 'marche'
  | 'sport'
  | 'gastronomie'
  | 'exposition'
  | 'atelier'
  | 'conference'
  | 'bienetre'
  | 'autre';

export type EventStatus = 'pending' | 'approved' | 'rejected';

// ===========================================
// NEW 2-LEVEL CATEGORY SYSTEM TYPES
// ===========================================

export type CategoryId =
  | 'musique_fete'
  | 'culture_arts'
  | 'sport_bienetre'
  | 'marches_food'
  | 'ateliers_rencontres'
  | 'communaute';

export interface EventCategory {
  id: CategoryId;
  icon: string;
  color: string;
  subcategories: string[];
}

export interface EventTag {
  id: string;
  group: 'prix' | 'moment' | 'lieu';
}

export type City =
  | 'saly'
  | 'mbour'
  | 'somone'
  | 'ngaparou'
  | 'warang'
  | 'nianing'
  | 'popenguine'
  | 'toubab_dialao';

export interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  title_en: string | null;
  title_wo: string | null;
  description: string;
  description_en: string | null;
  description_wo: string | null;
  // Legacy field (kept for backward compatibility)
  event_type: EventType;
  // New 2-level category system
  category: CategoryId | null;
  subcategory: string | null;
  tags: string[] | null;
  location_name: string;
  location_city: City;
  location_lat: number | null;
  location_lng: number | null;
  start_date: string;
  end_date: string | null;
  price: string | null;
  target_audience: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  image_url: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: User;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notify_new_events: boolean;
  preferred_categories: EventType[];
  preferred_cities: City[];
}

// Form types
export interface CreateEventInput {
  title: string;
  title_en?: string;
  title_wo?: string;
  description: string;
  description_en?: string;
  description_wo?: string;
  // Legacy field (kept for backward compatibility)
  event_type?: EventType;
  // New 2-level category system
  category: CategoryId;
  subcategory: string;
  tags?: string[];
  location_name: string;
  location_city: City;
  location_lat?: number;
  location_lng?: number;
  start_date: string;
  end_date?: string;
  price?: string;
  target_audience?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  image_url?: string;
}

// Filter types
export interface EventFilters {
  type?: EventType;
  category?: CategoryId;
  city?: City;
  tags?: string[];
  date?: 'today' | 'tomorrow' | 'this_week' | 'this_month';
  search?: string;
  status?: EventStatus;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
