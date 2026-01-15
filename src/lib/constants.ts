import type { City, EventType, EventCategory, EventTag } from '@/types';

// Legacy event types (kept for backward compatibility)
export const EVENT_TYPES: EventType[] = [
  'concert',
  'soiree',
  'culture',
  'marche',
  'sport',
  'gastronomie',
  'exposition',
  'atelier',
  'conference',
  'bienetre',
  'autre',
];

// ===========================================
// NEW 2-LEVEL CATEGORY SYSTEM
// ===========================================

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'musique_fete',
    icon: 'music',
    color: '#FF6B35',
    subcategories: ['concert_live', 'soiree_dj', 'beach_party', 'bar_lounge', 'autres'],
  },
  {
    id: 'culture_arts',
    icon: 'palette',
    color: '#8B5CF6',
    subcategories: ['exposition', 'spectacle_theatre', 'cinema', 'festival', 'autres'],
  },
  {
    id: 'sport_bienetre',
    icon: 'heart-pulse',
    color: '#4ECDC4',
    subcategories: ['lutte_traditionnelle', 'sports_nautiques', 'yoga_meditation', 'tournoi_match', 'autres'],
  },
  {
    id: 'marches_food',
    icon: 'utensils',
    color: '#F59E0B',
    subcategories: ['marche_local', 'restaurant_food', 'degustation', 'marche_artisanal', 'autres'],
  },
  {
    id: 'ateliers_rencontres',
    icon: 'users',
    color: '#06B6D4',
    subcategories: ['atelier_creatif', 'conference_talk', 'formation', 'networking', 'autres'],
  },
  {
    id: 'communaute',
    icon: 'hand-heart',
    color: '#22C55E',
    subcategories: ['nettoyage_plage', 'action_solidaire', 'sensibilisation', 'evenement_associatif', 'autres'],
  },
];

// Tag definitions
export const EVENT_TAGS: Record<string, EventTag[]> = {
  prix: [
    { id: 'gratuit', group: 'prix' },
    { id: 'payant', group: 'prix' },
  ],
  moment: [
    { id: 'jour', group: 'moment' },
    { id: 'soir', group: 'moment' },
  ],
  lieu: [
    { id: 'plage', group: 'lieu' },
    { id: 'ville', group: 'lieu' },
  ],
};

// Helper to get category by ID
export function getCategoryById(id: string): EventCategory | undefined {
  return EVENT_CATEGORIES.find((cat) => cat.id === id);
}

// Helper to get category color
export function getCategoryColor(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category?.color || '#6B7280';
}

export const CITIES: City[] = [
  'saly',
  'mbour',
  'somone',
  'ngaparou',
  'warang',
  'nianing',
  'popenguine',
  'toubab_dialao',
];

// Approximate coordinates for each city (Petite Côte, Senegal)
export const CITY_COORDINATES: Record<City, { lat: number; lng: number }> = {
  saly: { lat: 14.4500, lng: -17.0167 },
  mbour: { lat: 14.4167, lng: -16.9667 },
  somone: { lat: 14.4833, lng: -17.0833 },
  ngaparou: { lat: 14.4333, lng: -17.0333 },
  warang: { lat: 14.4000, lng: -16.9500 },
  nianing: { lat: 14.3333, lng: -16.9333 },
  popenguine: { lat: 14.5500, lng: -17.1167 },
  toubab_dialao: { lat: 14.5833, lng: -17.1333 },
};

// Center of Petite Côte region
export const PETITE_COTE_CENTER = { lat: 14.45, lng: -17.0 };
export const DEFAULT_ZOOM = 11;

// Event type icons (lucide icon names)
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  concert: 'music',
  soiree: 'party-popper',
  culture: 'sparkles',
  marche: 'shopping-bag',
  sport: 'dumbbell',
  gastronomie: 'utensils',
  exposition: 'palette',
  atelier: 'hammer',
  conference: 'mic-2',
  bienetre: 'heart',
  autre: 'calendar',
};

// Event type colors for badges and markers
// Simplified palette: warm (primary), cool (secondary), neutral (violet)
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  concert: '#FF6B35',   // primary (warm)
  soiree: '#FF6B35',    // primary (warm)
  gastronomie: '#FF6B35', // primary (warm)
  sport: '#4ECDC4',     // secondary (cool)
  bienetre: '#4ECDC4',  // secondary (cool)
  marche: '#4ECDC4',    // secondary (cool)
  culture: '#8B5CF6',   // violet (neutral)
  exposition: '#8B5CF6', // violet (neutral)
  conference: '#8B5CF6', // violet (neutral)
  atelier: '#8B5CF6',   // violet (neutral)
  autre: '#6B7280',     // gray
};

// ===========================================
// KNOWN PLACES - Lieux populaires de la Petite Côte
// ===========================================

export type PlaceType = 'hotel' | 'restaurant' | 'plage' | 'bar' | 'salle' | 'autre';

export interface KnownPlace {
  id: string;
  name: string;
  city: City;
  lat: number;
  lng: number;
  type: PlaceType;
}

export const KNOWN_PLACES: KnownPlace[] = [
  // === SALY ===
  // Hôtels
  { id: 'lamantin', name: 'Hôtel Lamantin Beach', city: 'saly', lat: 14.4483, lng: -17.0211, type: 'hotel' },
  { id: 'royam', name: 'Hôtel Royam', city: 'saly', lat: 14.4456, lng: -17.0178, type: 'hotel' },
  { id: 'neptune', name: 'Hôtel Neptune', city: 'saly', lat: 14.4512, lng: -17.0198, type: 'hotel' },
  { id: 'teranga', name: 'Hôtel Téranga', city: 'saly', lat: 14.4478, lng: -17.0156, type: 'hotel' },
  { id: 'espadon', name: 'Hôtel Espadon', city: 'saly', lat: 14.4445, lng: -17.0189, type: 'hotel' },
  { id: 'filaos', name: 'Hôtel Les Filaos', city: 'saly', lat: 14.4521, lng: -17.0234, type: 'hotel' },
  { id: 'palm_beach', name: 'Palm Beach Hotel', city: 'saly', lat: 14.4498, lng: -17.0201, type: 'hotel' },
  { id: 'bougainvillees', name: 'Hôtel Les Bougainvillées', city: 'saly', lat: 14.4467, lng: -17.0145, type: 'hotel' },
  // Restaurants & Bars
  { id: 'copacabana', name: 'Copacabana', city: 'saly', lat: 14.4472, lng: -17.0223, type: 'restaurant' },
  { id: 'poisson_dor', name: 'Le Poisson d\'Or', city: 'saly', lat: 14.4489, lng: -17.0187, type: 'restaurant' },
  { id: 'casa_saly', name: 'Casa Saly', city: 'saly', lat: 14.4501, lng: -17.0176, type: 'restaurant' },
  { id: 'le_phare', name: 'Le Phare', city: 'saly', lat: 14.4534, lng: -17.0245, type: 'bar' },
  { id: 'nirvana', name: 'Nirvana Beach', city: 'saly', lat: 14.4456, lng: -17.0234, type: 'bar' },
  // Plages & lieux
  { id: 'plage_saly', name: 'Plage de Saly', city: 'saly', lat: 14.4467, lng: -17.0256, type: 'plage' },
  { id: 'plage_saly_nord', name: 'Plage de Saly Nord', city: 'saly', lat: 14.4567, lng: -17.0278, type: 'plage' },

  // === MBOUR ===
  { id: 'marche_mbour', name: 'Marché aux poissons de Mbour', city: 'mbour', lat: 14.4167, lng: -16.9667, type: 'autre' },
  { id: 'port_mbour', name: 'Port de Mbour', city: 'mbour', lat: 14.4134, lng: -16.9623, type: 'autre' },
  { id: 'plage_mbour', name: 'Plage de Mbour', city: 'mbour', lat: 14.4156, lng: -16.9712, type: 'plage' },
  { id: 'tama_lodge', name: 'Tama Lodge', city: 'mbour', lat: 14.4189, lng: -16.9734, type: 'hotel' },

  // === SOMONE ===
  { id: 'lagune_somone', name: 'Lagune de Somone', city: 'somone', lat: 14.4833, lng: -17.0833, type: 'autre' },
  { id: 'royal_horizon', name: 'Royal Horizon', city: 'somone', lat: 14.4812, lng: -17.0856, type: 'hotel' },
  { id: 'domaine_somone', name: 'Domaine de Somone', city: 'somone', lat: 14.4798, lng: -17.0812, type: 'hotel' },
  { id: 'plage_somone', name: 'Plage de Somone', city: 'somone', lat: 14.4856, lng: -17.0889, type: 'plage' },

  // === NGAPAROU ===
  { id: 'plage_ngaparou', name: 'Plage de Ngaparou', city: 'ngaparou', lat: 14.4333, lng: -17.0456, type: 'plage' },
  { id: 'chez_salim', name: 'Chez Salim', city: 'ngaparou', lat: 14.4312, lng: -17.0423, type: 'restaurant' },
  { id: 'auberge_ngaparou', name: 'Auberge de Ngaparou', city: 'ngaparou', lat: 14.4345, lng: -17.0412, type: 'hotel' },

  // === WARANG ===
  { id: 'plage_warang', name: 'Plage de Warang', city: 'warang', lat: 14.4000, lng: -16.9623, type: 'plage' },

  // === NIANING ===
  { id: 'club_aldiana', name: 'Club Aldiana', city: 'nianing', lat: 14.3312, lng: -16.9456, type: 'hotel' },
  { id: 'plage_nianing', name: 'Plage de Nianing', city: 'nianing', lat: 14.3333, lng: -16.9512, type: 'plage' },

  // === POPENGUINE ===
  { id: 'sanctuaire_popenguine', name: 'Sanctuaire Marial de Popenguine', city: 'popenguine', lat: 14.5489, lng: -17.1123, type: 'autre' },
  { id: 'reserve_popenguine', name: 'Réserve naturelle de Popenguine', city: 'popenguine', lat: 14.5512, lng: -17.1089, type: 'autre' },
  { id: 'plage_popenguine', name: 'Plage de Popenguine', city: 'popenguine', lat: 14.5467, lng: -17.1178, type: 'plage' },

  // === TOUBAB DIALAO ===
  { id: 'sobo_bade', name: 'Sobo Badé', city: 'toubab_dialao', lat: 14.5834, lng: -17.1345, type: 'autre' },
  { id: 'plage_toubab', name: 'Plage de Toubab Dialao', city: 'toubab_dialao', lat: 14.5812, lng: -17.1378, type: 'plage' },
];

// Helper to search known places
export function searchKnownPlaces(query: string): KnownPlace[] {
  if (!query || query.length < 2) return [];
  const normalized = query.toLowerCase();
  return KNOWN_PLACES.filter(place =>
    place.name.toLowerCase().includes(normalized)
  );
}
