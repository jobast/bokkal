'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Loader2, X, Maximize2, Minimize2, Layers } from 'lucide-react';
import { PETITE_COTE_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Tile layer URLs
const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
};

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  value?: { lat: number; lng: number } | null;
  onChange: (location: { lat: number; lng: number; address?: string } | null) => void;
  placeholder?: string;
  /** When true, the map will recenter on the value when it changes externally */
  centerOnValue?: boolean;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterHandler({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
}

// Component to handle map resize when fullscreen changes
function MapResizeHandler({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    // Small delay to let CSS transition complete
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
}

export function LocationPicker({ value, onChange, placeholder = 'Rechercher une adresse...', centerOnValue = false }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<{ lat: number; lng: number } | null>(null);

  // Center map when value changes externally (e.g., from autocomplete)
  useEffect(() => {
    if (centerOnValue && value) {
      // Only recenter if value actually changed (not from map click)
      const prevValue = prevValueRef.current;
      if (!prevValue || prevValue.lat !== value.lat || prevValue.lng !== value.lng) {
        setMapCenter([value.lat, value.lng]);
      }
    }
    prevValueRef.current = value || null;
  }, [value, centerOnValue]);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Debounced search
  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search with bias towards Petite Côte, Senegal
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query + ', Senegal')}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `viewbox=-17.2,-14.2,-16.8,14.7&` +
        `bounded=0`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 300);
  };

  // Handle selecting a search result
  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setSelectedAddress(result.display_name);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowResults(false);
    setMapCenter([lat, lng]);

    onChange({ lat, lng, address: result.display_name });
  };

  // Handle clicking on the map
  const handleMapClick = async (lat: number, lng: number) => {
    onChange({ lat, lng });

    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (data.display_name) {
        setSelectedAddress(data.display_name);
        setSearchQuery(data.display_name.split(',')[0]);
        onChange({ lat, lng, address: data.display_name });
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSearchQuery('');
    setSelectedAddress('');
    setSearchResults([]);
    setShowResults(false);
    onChange(null);
  };

  const currentTileLayer = TILE_LAYERS[mapStyle];

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && searchResults.length > 0 && (
          <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectResult(result)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span className="line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Map container - fullscreen or normal */}
      <div
        ref={containerRef}
        className={cn(
          'rounded-lg overflow-hidden border border-border transition-all duration-300',
          isFullscreen
            ? 'fixed inset-4 z-50 h-auto'
            : 'h-64 relative'
        )}
      >
        {/* Fullscreen backdrop */}
        {isFullscreen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[-1]"
            onClick={() => setIsFullscreen(false)}
          />
        )}

        {/* Map controls */}
        <div className="absolute top-2 right-2 z-[1000] flex gap-1">
          {/* Map style toggle */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
            className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-100"
            title={mapStyle === 'street' ? 'Vue satellite' : 'Vue carte'}
          >
            <Layers className="h-4 w-4" />
          </Button>

          {/* Fullscreen toggle */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-100"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Map style label */}
        <div className="absolute bottom-2 left-2 z-[1000]">
          <span className="text-xs bg-white/90 px-2 py-1 rounded shadow-sm">
            {mapStyle === 'street' ? 'Carte' : 'Satellite'}
          </span>
        </div>

        <MapContainer
          center={[PETITE_COTE_CENTER.lat, PETITE_COTE_CENTER.lng]}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={mapStyle}
            attribution={currentTileLayer.attribution}
            url={currentTileLayer.url}
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <MapCenterHandler center={mapCenter} />
          <MapResizeHandler isFullscreen={isFullscreen} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={customIcon} />
          )}
        </MapContainer>
      </div>

      {/* Selected location info */}
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {selectedAddress ? (
              <p className="truncate">{selectedAddress}</p>
            ) : (
              <p>
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 px-2">
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Recherchez une adresse ou cliquez sur la carte pour placer le marqueur
      </p>
    </div>
  );
}
