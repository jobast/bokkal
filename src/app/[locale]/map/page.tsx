'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { EVENT_CATEGORIES, EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';

// Dynamically import the map component with SSR disabled
const EventMap = dynamic(
  () => import('@/components/map/EventMap').then((mod) => mod.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

function EventListItem({ event, locale }: { event: Event; locale: string }) {
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const dateLocale = locale === 'fr' ? fr : enUS;

  const title =
    locale === 'en' && event.title_en
      ? event.title_en
      : locale === 'wo' && event.title_wo
      ? event.title_wo
      : event.title;

  // Use new category system if available, fallback to legacy event_type
  const category = event.category ? getCategoryById(event.category) : null;
  const color = category?.color || EVENT_TYPE_COLORS[event.event_type] || '#6B7280';
  const label = event.category ? tCategories(event.category) : tTypes(event.event_type);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <Badge
            variant="secondary"
            className="mb-2 text-xs"
            style={{
              backgroundColor: `${color}20`,
              color: color,
            }}
          >
            {label}
          </Badge>
          <h3 className="font-medium mb-2 line-clamp-1">{title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">
                {event.location_name}, {tCities(event.location_city)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3 w-3" />
              <span>
                {format(new Date(event.start_date), 'd MMM', { locale: dateLocale })}
              </span>
              <Clock className="h-3 w-3 ml-2" />
              <span>
                {format(new Date(event.start_date), 'HH:mm', { locale: dateLocale })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MapLegend() {
  const tCategories = useTranslations('events.categories');

  return (
    <div className="hidden lg:block absolute bottom-4 left-4 z-[1000]">
      <div className="bg-background/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-3">
          {EVENT_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-xs">{tCategories(cat.id)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const locale = useLocale();
  const t = useTranslations('map');

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents((data || []) as Event[]);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  // Filter events with coordinates
  const eventsWithCoordinates = useMemo(
    () => events.filter((event) => event.location_lat && event.location_lng),
    [events]
  );

  if (loading) {
    return (
      <div className="relative h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Map */}
      <div className="absolute inset-0">
        <EventMap events={eventsWithCoordinates} />
      </div>

      {/* Header overlay - desktop only */}
      <div className="hidden lg:block absolute top-4 left-4 z-[1000] pointer-events-auto">
        <div className="bg-background/95 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block absolute top-4 bottom-4 right-4 w-80 z-[1000]">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                Événements ({eventsWithCoordinates.length})
              </h2>
            </div>
            {eventsWithCoordinates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement avec localisation
              </p>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3">
                {eventsWithCoordinates.map((event) => (
                  <EventListItem key={event.id} event={event} locale={locale} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legend - desktop only */}
      <MapLegend />
    </div>
  );
}
