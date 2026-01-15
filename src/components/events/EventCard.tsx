'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  MapPin,
  Clock,
  Music,
  PartyPopper,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  Utensils,
  Calendar,
  Palette,
  Hammer,
  Mic2,
  Heart,
  HeartPulse,
  Users,
  HeartHandshake,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Event, EventType, CategoryId } from '@/types';
import { EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';
import { formatPrice, isFreeEvent } from '@/lib/utils';

// Legacy type icons
const typeIcons: Record<EventType, React.ComponentType<{ className?: string }>> = {
  concert: Music,
  soiree: PartyPopper,
  culture: Sparkles,
  marche: ShoppingBag,
  sport: Dumbbell,
  gastronomie: Utensils,
  exposition: Palette,
  atelier: Hammer,
  conference: Mic2,
  bienetre: Heart,
  autre: Calendar,
};

// New category icons
const categoryIcons: Record<CategoryId, React.ComponentType<{ className?: string }>> = {
  musique_fete: Music,
  culture_arts: Palette,
  sport_bienetre: HeartPulse,
  marches_food: Utensils,
  ateliers_rencontres: Users,
  communaute: HeartHandshake,
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const locale = useLocale();
  const t = useTranslations('events');
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');

  const dateLocale = locale === 'fr' ? fr : enUS;

  // Use new category system if available, otherwise fall back to legacy
  const hasNewCategory = event.category && event.category in categoryIcons;
  const category = hasNewCategory ? getCategoryById(event.category!) : null;
  const TypeIcon = hasNewCategory
    ? categoryIcons[event.category as CategoryId]
    : (typeIcons[event.event_type] || Calendar);
  const badgeColor = hasNewCategory
    ? category?.color
    : EVENT_TYPE_COLORS[event.event_type];
  const badgeLabel = hasNewCategory
    ? tCategories(event.category as CategoryId)
    : tTypes(event.event_type);

  // Get localized title
  const title =
    locale === 'en' && event.title_en
      ? event.title_en
      : locale === 'wo' && event.title_wo
      ? event.title_wo
      : event.title;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="card-hover group overflow-hidden cursor-pointer h-full border">
        {/* Image */}
        <div className="relative h-48 placeholder-pattern">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <TypeIcon className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category/Type badge */}
          <Badge
            className="absolute top-3 left-3 gap-1 border-0"
            style={{ backgroundColor: badgeColor }}
          >
            <TypeIcon className="h-3 w-3" />
            {badgeLabel}
          </Badge>

          {/* Price badge */}
          <Badge
            variant="secondary"
            className={`absolute top-3 right-3 ${isFreeEvent(event.price) ? 'bg-green-500 text-white hover:bg-green-500' : ''}`}
          >
            {formatPrice(event.price, locale)}
          </Badge>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="space-y-2 text-sm text-muted-foreground">
            {/* Date */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                {format(new Date(event.start_date), 'EEEE d MMMM', {
                  locale: dateLocale,
                })}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
              <span>
                {format(new Date(event.start_date), 'HH:mm', { locale: dateLocale })}
                {event.end_date &&
                  ` - ${format(new Date(event.end_date), 'HH:mm', {
                    locale: dateLocale,
                  })}`}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
              <span className="line-clamp-1">
                {event.location_name}, {tCities(event.location_city)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
