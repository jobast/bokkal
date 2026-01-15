'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Hotel,
  Utensils,
  Waves,
  Wine,
  Building2,
  Loader2,
  Globe,
} from 'lucide-react';
import type { City } from '@/types';
import { searchKnownPlaces, type KnownPlace, type PlaceType, CITIES } from '@/lib/constants';

// Location selection result
export interface LocationSelection {
  name: string;
  city?: City;
  lat?: number;
  lng?: number;
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (location: LocationSelection) => void;
  placeholder?: string;
  className?: string;
}

// Photon API response types
interface PhotonProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  state?: string;
  country?: string;
  osm_key?: string;
  osm_value?: string;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
  properties: PhotonProperties;
}

interface PhotonResponse {
  features: PhotonFeature[];
}

// Combined suggestion type
interface Suggestion {
  id: string;
  name: string;
  subtitle: string;
  city?: City;
  lat?: number;
  lng?: number;
  type: PlaceType;
  source: 'local' | 'photon';
}

// Icon mapping for place types
const placeTypeIcons: Record<PlaceType, React.ComponentType<{ className?: string }>> = {
  hotel: Hotel,
  restaurant: Utensils,
  plage: Waves,
  bar: Wine,
  salle: Building2,
  autre: MapPin,
};

// Detect place type from Photon OSM data
function detectPlaceType(properties: PhotonProperties): PlaceType {
  const key = properties.osm_key?.toLowerCase() || '';
  const value = properties.osm_value?.toLowerCase() || '';

  if (key === 'tourism' && value === 'hotel') return 'hotel';
  if (key === 'tourism' && value === 'guest_house') return 'hotel';
  if (key === 'amenity' && value === 'restaurant') return 'restaurant';
  if (key === 'amenity' && value === 'cafe') return 'restaurant';
  if (key === 'amenity' && value === 'bar') return 'bar';
  if (key === 'amenity' && value === 'pub') return 'bar';
  if (key === 'amenity' && value === 'nightclub') return 'bar';
  if (key === 'natural' && value === 'beach') return 'plage';
  if (key === 'leisure' && value === 'beach_resort') return 'plage';
  if (key === 'amenity' && (value === 'theatre' || value === 'cinema' || value === 'community_centre')) return 'salle';

  return 'autre';
}

// Detect city from Photon result
function detectCityFromPhoton(properties: PhotonProperties): City | undefined {
  const cityName = (properties.city || properties.state || '').toLowerCase();

  for (const city of CITIES) {
    if (cityName.includes(city.replace('_', ' '))) {
      return city;
    }
  }

  // Special cases
  if (cityName.includes('mbour') || cityName.includes('m\'bour')) return 'mbour';
  if (cityName.includes('popenguin')) return 'popenguine';
  if (cityName.includes('dialao') || cityName.includes('dialaw')) return 'toubab_dialao';

  return undefined;
}

// Format display name from Photon result
function formatPhotonName(properties: PhotonProperties): string {
  if (properties.name) return properties.name;
  if (properties.street) {
    return properties.housenumber
      ? `${properties.housenumber} ${properties.street}`
      : properties.street;
  }
  return 'Lieu sans nom';
}

// Format subtitle from Photon result
function formatPhotonSubtitle(properties: PhotonProperties): string {
  const parts: string[] = [];
  if (properties.city) parts.push(properties.city);
  else if (properties.state) parts.push(properties.state);
  if (properties.country && properties.country !== 'Sénégal') parts.push(properties.country);
  return parts.join(', ') || 'Sénégal';
}

// Search Photon API
async function searchPhoton(query: string): Promise<PhotonFeature[]> {
  try {
    // Geofence: Petite Côte bounding box (minLon, minLat, maxLon, maxLat)
    // Covers from Popenguine/Toubab Dialao to Nianing/Joal with buffer
    // Excludes Dakar and Rufisque
    const bbox = '-17.15,14.05,-16.70,14.60';

    // Center bias on Petite Côte region for better relevance
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=14.45&lon=-17.0&bbox=${bbox}&limit=5&lang=fr`
    );

    if (!response.ok) {
      console.error('Photon API error:', response.status);
      return [];
    }

    const data: PhotonResponse = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Photon search error:', error);
    return [];
  }
}

// Convert local place to suggestion
function localToSuggestion(place: KnownPlace): Suggestion {
  return {
    id: `local-${place.id}`,
    name: place.name,
    subtitle: place.city,
    city: place.city,
    lat: place.lat,
    lng: place.lng,
    type: place.type,
    source: 'local',
  };
}

// Convert Photon result to suggestion
function photonToSuggestion(feature: PhotonFeature, index: number): Suggestion {
  const { properties, geometry } = feature;
  const name = formatPhotonName(properties);

  return {
    id: `photon-${index}-${name}`,
    name,
    subtitle: formatPhotonSubtitle(properties),
    city: detectCityFromPhoton(properties),
    lat: geometry.coordinates[1], // Photon returns [lng, lat]
    lng: geometry.coordinates[0],
    type: detectPlaceType(properties),
    source: 'photon',
  };
}

export function LocationAutocomplete({
  value,
  onSelect,
  placeholder,
  className,
}: LocationAutocompleteProps) {
  const tCities = useTranslations('cities');
  const tForm = useTranslations('eventForm.fields');

  const [inputValue, setInputValue] = useState(value);
  const [localSuggestions, setLocalSuggestions] = useState<Suggestion[]>([]);
  const [photonSuggestions, setPhotonSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Search when input changes
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Search local places immediately (2+ chars)
    if (inputValue.length >= 2) {
      const localResults = searchKnownPlaces(inputValue);
      setLocalSuggestions(localResults.slice(0, 5).map(localToSuggestion));
      setShowSuggestions(true);

      // Search Photon with debounce (3+ chars, < 3 local results)
      if (inputValue.length >= 3 && localResults.length < 3) {
        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
          const photonResults = await searchPhoton(inputValue);

          // Filter out duplicates (similar names)
          const localNames = new Set(localResults.map(r => r.name.toLowerCase()));
          const filtered = photonResults.filter(
            f => !localNames.has(formatPhotonName(f.properties).toLowerCase())
          );

          setPhotonSuggestions(filtered.slice(0, 5).map(photonToSuggestion));
          setIsSearching(false);
        }, 400);
      } else {
        setPhotonSuggestions([]);
        setIsSearching(false);
      }
    } else {
      setLocalSuggestions([]);
      setPhotonSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Always update parent with current input
    onSelect({ name: newValue });
  }, [onSelect]);

  const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
    setInputValue(suggestion.name);
    onSelect({
      name: suggestion.name,
      city: suggestion.city,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  const hasSuggestions = localSuggestions.length > 0 || photonSuggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 2 && hasSuggestions && setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (hasSuggestions || isSearching) && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
          {/* Local suggestions */}
          {localSuggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50">
                {tForm('knownPlaces')}
              </div>
              {localSuggestions.map((suggestion) => {
                const Icon = placeTypeIcons[suggestion.type];
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{suggestion.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {tCities(suggestion.city as City)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Photon suggestions */}
          {photonSuggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                {tForm('otherResults')}
              </div>
              {photonSuggestions.map((suggestion) => {
                const Icon = placeTypeIcons[suggestion.type];
                return (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{suggestion.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {suggestion.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading indicator */}
          {isSearching && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {tForm('searching')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
