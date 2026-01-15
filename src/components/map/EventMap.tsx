'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Event, CategoryId } from '@/types';
import { PETITE_COTE_CENTER, DEFAULT_ZOOM, EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';
import { formatPrice, isFreeEvent } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface EventMapProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

// Helper to get event color (new category system or fallback to legacy)
function getEventColor(event: Event): string {
  if (event.category) {
    const category = getCategoryById(event.category);
    if (category) return category.color;
  }
  return EVENT_TYPE_COLORS[event.event_type] || '#6B7280';
}

// Store map instance outside React to survive Strict Mode
let globalMapInstance: any = null;
let globalMapContainerId: string | null = null;
let globalMarkersLayer: any = null;

export function EventMap({ events, onEventClick }: EventMapProps) {
  const locale = useLocale();
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const dateLocale = locale === 'fr' ? fr : enUS;

  // Use refs for values that shouldn't trigger re-renders
  const onEventClickRef = useRef(onEventClick);
  const tTypesRef = useRef(tTypes);
  const tCategoriesRef = useRef(tCategories);
  const tCitiesRef = useRef(tCities);
  const dateLocaleRef = useRef(dateLocale);
  const localeRef = useRef(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Update refs on each render
  onEventClickRef.current = onEventClick;
  tTypesRef.current = tTypes;
  tCategoriesRef.current = tCategories;
  tCitiesRef.current = tCities;
  dateLocaleRef.current = dateLocale;
  localeRef.current = locale;

  // Helper function to add markers to the map
  const addMarkersToMap = useCallback((eventsToAdd: Event[], L: any) => {
    if (!globalMarkersLayer || !L) return;

    // Clear existing markers
    globalMarkersLayer.clearLayers();

    // Add new markers
    eventsToAdd.forEach((event) => {
      if (event.location_lat && event.location_lng) {
        const markerColor = getEventColor(event);
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background-color: ${markerColor};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            ">
              <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">
                ●
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([event.location_lat, event.location_lng], { icon });

        // Create popup content inline
        const currentLocale = localeRef.current;
        const currentTTypes = tTypesRef.current;
        const currentTCategories = tCategoriesRef.current;
        const currentTCities = tCitiesRef.current;
        const currentDateLocale = dateLocaleRef.current;

        const title =
          currentLocale === 'en' && event.title_en
            ? event.title_en
            : currentLocale === 'wo' && event.title_wo
            ? event.title_wo
            : event.title;

        const color = getEventColor(event);
        const categoryLabel = event.category
          ? currentTCategories(event.category)
          : currentTTypes(event.event_type);

        const popupContent = `
          <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="
              display: inline-block;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 500;
              background-color: ${color};
              color: white;
              border-radius: 6px;
              margin-bottom: 10px;
            ">${categoryLabel}</div>
            <h3 style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #1a1a1a; line-height: 1.3;">${title}</h3>
            <div style="font-size: 13px; color: #666; line-height: 1.6;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="color: ${color};">●</span>
                ${event.location_name}, ${currentTCities(event.location_city)}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="color: ${color};">●</span>
                ${format(new Date(event.start_date), 'd MMM yyyy, HH:mm', { locale: currentDateLocale })}
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: ${isFreeEvent(event.price) ? '#22c55e' : color};">●</span>
                <span style="${isFreeEvent(event.price) ? 'color: #22c55e; font-weight: 500;' : ''}">${formatPrice(event.price, currentLocale)}</span>
              </div>
            </div>
            <a href="/${currentLocale}/events/${event.id}" style="
              display: inline-block;
              margin-top: 12px;
              padding: 8px 16px;
              background-color: #FF6B35;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
            ">Voir détails →</a>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 280,
          className: 'custom-popup',
        });

        marker.addTo(globalMarkersLayer);

        // Click handler with stopPropagation to prevent event bubbling
        marker.on('click', (e: any) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          if (onEventClickRef.current) {
            onEventClickRef.current(event);
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;

    const containerId = containerRef.current.id || 'event-map-container';

    // If we already have a map for this container, reuse it
    if (globalMapInstance && globalMapContainerId === containerId) {
      // Hide loading overlay
      const overlay = containerRef.current.parentElement?.querySelector('.map-loading-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
      }

      // Still need to add markers when reusing map (fixes initial load issue)
      if (globalMarkersLayer && leafletRef.current) {
        addMarkersToMap(eventsRef.current, leafletRef.current);
      }
      return;
    }

    // Clean up any existing map before creating a new one
    if (globalMapInstance) {
      try {
        globalMapInstance.remove();
      } catch (e) {
        // Map might already be removed
      }
      globalMapInstance = null;
      globalMapContainerId = null;
    }

    let isCancelled = false;

    const initMap = async () => {
      const L = await import('leaflet');
      if (isCancelled) return;

      leafletRef.current = L.default;

      if (!containerRef.current) return;

      // Double-check we don't already have a map
      if (globalMapInstance && globalMapContainerId === containerId) return;

      // Create map
      const map = leafletRef.current.map(containerRef.current, {
        closePopupOnClick: false,
      }).setView(
        [PETITE_COTE_CENTER.lat, PETITE_COTE_CENTER.lng],
        DEFAULT_ZOOM
      );

      if (isCancelled) {
        map.remove();
        return;
      }

      // Store globally
      globalMapInstance = map;
      globalMapContainerId = containerId;

      // Add tiles
      leafletRef.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Create markers layer group
      globalMarkersLayer = leafletRef.current.layerGroup().addTo(map);

      // Add initial markers
      addMarkersToMap(eventsRef.current, leafletRef.current);

      // Hide loading overlay using DOM manipulation (no state change = no re-render)
      const overlay = containerRef.current?.parentElement?.querySelector('.map-loading-overlay');
      if (overlay) {
        overlay.classList.add('hidden');
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      // Don't cleanup the map here - it will cause flashing in Strict Mode
      // The map will be cleaned up when a new one is created or on page navigation
    };
  }, [addMarkersToMap]);

  // Update markers when events change
  useEffect(() => {
    if (!globalMapInstance || !globalMarkersLayer || !leafletRef.current) return;
    addMarkersToMap(events, leafletRef.current);
  }, [events, addMarkersToMap]);

  // Cleanup only on actual unmount (navigation away)
  useEffect(() => {
    return () => {
      // This cleanup runs on true unmount
      if (globalMapInstance) {
        try {
          globalMapInstance.remove();
        } catch (e) {
          // Ignore errors
        }
        globalMapInstance = null;
        globalMapContainerId = null;
        globalMarkersLayer = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} id="event-map" className="w-full h-full rounded-lg" />
      <div className="map-loading-overlay absolute inset-0 bg-muted animate-pulse flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>
  );
}
