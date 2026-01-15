import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareButtons } from '@/components/shared/ShareButtons';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  Ticket,
  Music,
  PartyPopper,
  Sparkles,
  ShoppingBag,
  Dumbbell,
  Utensils,
  Calendar,
  MessageCircle,
  ExternalLink,
  Palette,
  Hammer,
  Mic2,
  Heart,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Event, EventType, CategoryId } from '@/types';
import { EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';
import { formatPrice, isFreeEvent } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

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

const categoryIcons: Record<CategoryId, React.ComponentType<{ className?: string }>> = {
  musique_fete: Music,
  culture_arts: Palette,
  sport_bienetre: Heart,
  marches_food: Utensils,
  ateliers_rencontres: Users,
  communaute: Heart,
};

async function getEvent(id: string): Promise<Event | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return data as Event | null;
}

async function EventDetailContent({ event, locale }: { event: Event; locale: string }) {
  const t = await getTranslations('events');
  const tTypes = await getTranslations('events.types');
  const tCategories = await getTranslations('events.categories');
  const tCities = await getTranslations('cities');
  const dateLocale = locale === 'fr' ? fr : enUS;

  // Use new category system if available
  const hasCategory = event.category && event.category in categoryIcons;
  const category = hasCategory ? getCategoryById(event.category!) : null;
  const TypeIcon = hasCategory
    ? categoryIcons[event.category as CategoryId]
    : (typeIcons[event.event_type] || Calendar);
  const badgeColor = hasCategory ? category?.color : EVENT_TYPE_COLORS[event.event_type];
  const badgeLabel = hasCategory ? tCategories(event.category!) : tTypes(event.event_type);

  // Get localized content
  const title =
    locale === 'en' && event.title_en
      ? event.title_en
      : locale === 'wo' && event.title_wo
      ? event.title_wo
      : event.title;

  const description =
    locale === 'en' && event.description_en
      ? event.description_en
      : locale === 'wo' && event.description_wo
      ? event.description_wo
      : event.description;

  // Generate calendar link
  const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${event.start_date.replace(/[-:]/g, '').split('.')[0]}Z/${
    event.end_date
      ? event.end_date.replace(/[-:]/g, '').split('.')[0] + 'Z'
      : event.start_date.replace(/[-:]/g, '').split('.')[0] + 'Z'
  }&location=${encodeURIComponent(
    `${event.location_name}, ${event.location_city}`
  )}&details=${encodeURIComponent(description.substring(0, 200))}`;

  // Google Maps link
  const mapsUrl = event.location_lat && event.location_lng
    ? `https://www.google.com/maps/search/?api=1&query=${event.location_lat},${event.location_lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.location_name}, ${event.location_city}, Senegal`
      )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('title')}
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image/Header */}
          <div className="relative rounded-xl overflow-hidden">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={title}
                className="w-full h-64 md:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TypeIcon className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge
                className="mb-3 gap-1"
                style={{ backgroundColor: badgeColor }}
              >
                <TypeIcon className="h-3 w-3" />
                {badgeLabel}
              </Badge>
              <h1 className="text-2xl md:text-4xl font-bold text-white">{title}</h1>
            </div>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex gap-2">
            <ShareButtons title={title} />
            <Button asChild variant="outline" size="sm">
              <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                <CalendarDays className="h-4 w-4 mr-2" />
                {t('addToCalendar')}
              </a>
            </Button>
          </div>

          {/* Event details card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.start_date), 'EEEE d MMMM yyyy', {
                      locale: dateLocale,
                    })}
                  </p>
                  {event.end_date &&
                    format(new Date(event.start_date), 'yyyy-MM-dd') !==
                      format(new Date(event.end_date), 'yyyy-MM-dd') && (
                      <p className="text-sm text-muted-foreground">
                        au{' '}
                        {format(new Date(event.end_date), 'EEEE d MMMM', {
                          locale: dateLocale,
                        })}
                      </p>
                    )}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.start_date), 'HH:mm', {
                      locale: dateLocale,
                    })}
                    {event.end_date &&
                      ` - ${format(new Date(event.end_date), 'HH:mm', {
                        locale: dateLocale,
                      })}`}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{event.location_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {tCities(event.location_city)}, Sénégal
                  </p>
                  <Button asChild variant="link" size="sm" className="px-0 h-auto">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                      {t('getDirections')}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className={`font-medium ${isFreeEvent(event.price) ? 'text-green-600' : ''}`}>
                    {formatPrice(event.price, locale)}
                  </p>
                </div>
              </div>

              {/* Audience */}
              {event.target_audience && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{event.target_audience}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact card */}
          {(event.contact_phone || event.contact_email || event.contact_whatsapp) && (
            <Card>
              <CardHeader>
                <CardTitle>{t('contact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.contact_phone && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={`tel:${event.contact_phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      {event.contact_phone}
                    </a>
                  </Button>
                )}
                {event.contact_whatsapp && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a
                      href={`https://wa.me/${event.contact_whatsapp.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {event.contact_email && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href={`mailto:${event.contact_email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      {event.contact_email}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('events');

  const event = await getEvent(id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t('notFound')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('notFoundDescription')}
        </p>
        <Button asChild>
          <Link href="/events">{t('backToEvents')}</Link>
        </Button>
      </div>
    );
  }

  return <EventDetailContent event={event} locale={locale} />;
}
