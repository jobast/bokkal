export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_verified: boolean;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          title_en: string | null;
          title_wo: string | null;
          description: string;
          description_en: string | null;
          description_wo: string | null;
          event_type: string;
          category: string | null;
          subcategory: string | null;
          tags: string[] | null;
          location_name: string;
          location_city: string;
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
          status: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          title_en?: string | null;
          title_wo?: string | null;
          description: string;
          description_en?: string | null;
          description_wo?: string | null;
          event_type?: string;
          category?: string | null;
          subcategory?: string | null;
          tags?: string[] | null;
          location_name: string;
          location_city: string;
          location_lat?: number | null;
          location_lng?: number | null;
          start_date: string;
          end_date?: string | null;
          price?: string | null;
          target_audience?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          contact_whatsapp?: string | null;
          image_url?: string | null;
          status?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          title_en?: string | null;
          title_wo?: string | null;
          description?: string;
          description_en?: string | null;
          description_wo?: string | null;
          event_type?: string;
          category?: string | null;
          subcategory?: string | null;
          tags?: string[] | null;
          location_name?: string;
          location_city?: string;
          location_lat?: number | null;
          location_lng?: number | null;
          start_date?: string;
          end_date?: string | null;
          price?: string | null;
          target_audience?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          contact_whatsapp?: string | null;
          image_url?: string | null;
          status?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_categories: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_en: string;
          name_wo: string;
          icon: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_en: string;
          name_wo: string;
          icon: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name_fr?: string;
          name_en?: string;
          name_wo?: string;
          icon?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          notify_new_events: boolean;
          preferred_categories: string[];
          preferred_cities: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          notify_new_events?: boolean;
          preferred_categories?: string[];
          preferred_cities?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          notify_new_events?: boolean;
          preferred_categories?: string[];
          preferred_cities?: string[];
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      event_type: 'concert' | 'soiree' | 'culture' | 'marche' | 'sport' | 'gastronomie' | 'autre';
      event_status: 'pending' | 'approved' | 'rejected';
    };
  };
}
