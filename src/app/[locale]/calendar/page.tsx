'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  Clock,
  MapPin,
  Loader2,
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';

export default function CalendarPage() {
  const locale = useLocale();
  const t = useTranslations('calendar');
  const tTypes = useTranslations('events.types');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const dateLocale = locale === 'fr' ? fr : enUS;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
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

  // Get events for the selected date
  const selectedDateEvents = selectedDate
    ? events.filter((event) =>
        isSameDay(new Date(event.start_date), selectedDate)
      )
    : [];

  // Get days with events in current month
  const daysWithEvents = events
    .map((event) => new Date(event.start_date))
    .filter((date) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      return date >= monthStart && date <= monthEnd;
    });

  // Get localized title for events
  const getEventTitle = (event: Event) => {
    if (locale === 'en' && event.title_en) return event.title_en;
    if (locale === 'wo' && event.title_wo) return event.title_wo;
    return event.title;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              locale={dateLocale}
              className="w-full"
              classNames={{
                months: 'w-full',
                month: 'w-full space-y-4',
                caption: 'flex justify-center pt-1 relative items-center mb-4',
                caption_label: 'text-lg font-semibold capitalize',
                nav: 'space-x-1 flex items-center',
                nav_button:
                  'h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 border rounded-md',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex w-full',
                head_cell:
                  'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] uppercase',
                row: 'flex w-full mt-2',
                cell: 'relative w-full p-0 text-center text-sm focus-within:relative focus-within:z-20',
                day: 'h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md',
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground font-bold',
                day_outside: 'text-muted-foreground opacity-50',
                day_disabled: 'text-muted-foreground opacity-50',
                day_hidden: 'invisible',
              }}
              modifiers={{
                hasEvent: daysWithEvents,
              }}
              modifiersClassNames={{
                hasEvent: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full',
              }}
            />
          </CardContent>
        </Card>

        {/* Selected date events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {selectedDate
                ? format(selectedDate, 'EEEE d MMMM', { locale: dateLocale })
                : t('today')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun événement ce jour
              </p>
            ) : (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => {
                  const category = event.category ? getCategoryById(event.category) : null;
                  const color = category?.color || EVENT_TYPE_COLORS[event.event_type] || '#6B7280';
                  const label = event.category ? tCategories(event.category) : tTypes(event.event_type);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1 h-full min-h-[60px] rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <Badge
                              variant="secondary"
                              className="mb-1 text-xs"
                              style={{
                                backgroundColor: `${color}20`,
                                color: color,
                              }}
                            >
                              {label}
                            </Badge>
                            <h3 className="font-medium line-clamp-1">
                              {getEventTitle(event)}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(event.start_date), 'HH:mm')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tCities(event.location_city)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
