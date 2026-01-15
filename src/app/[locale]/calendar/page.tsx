'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Clock,
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  parseISO,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';
import { EVENT_TYPE_COLORS, getCategoryById } from '@/lib/constants';
import { formatPrice, isFreeEvent } from '@/lib/utils';

export default function CalendarPage() {
  const locale = useLocale();
  const t = useTranslations('calendar');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const dateLocale = locale === 'fr' ? fr : enUS;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  // Get calendar days for current month view
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(parseISO(event.start_date), day));
  };

  // Get events for the selected date
  const selectedDateEvents = getEventsForDay(selectedDate);

  // Get upcoming events (next 5)
  const upcomingEvents = events
    .filter((event) => !isBefore(parseISO(event.start_date), new Date()))
    .slice(0, 5);

  // Get localized title for events
  const getEventTitle = (event: Event) => {
    if (locale === 'en' && event.title_en) return event.title_en;
    if (locale === 'wo' && event.title_wo) return event.title_wo;
    return event.title;
  };

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Weekday headers
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Calendar - Full Width Custom Design */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold capitalize ml-2">
                    {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                  </h2>
                </div>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Aujourd'hui
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isDayToday = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative min-h-[80px] md:min-h-[100px] p-1 md:p-2 rounded-lg border transition-all text-left
                        ${isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                        ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'}
                        ${isDayToday ? 'bg-primary/5' : ''}
                      `}
                    >
                      <span
                        className={`
                          text-sm font-medium
                          ${isDayToday ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>

                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const category = event.category ? getCategoryById(event.category) : null;
                            const color = category?.color || EVENT_TYPE_COLORS[event.event_type] || '#6B7280';
                            return (
                              <div
                                key={event.id}
                                className="text-[10px] md:text-xs truncate px-1 py-0.5 rounded"
                                style={{ backgroundColor: `${color}20`, color: color }}
                              >
                                <span className="hidden md:inline">
                                  {format(parseISO(event.start_date), 'HH:mm')} -{' '}
                                </span>
                                {getEventTitle(event)}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{dayEvents.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected date events - Below calendar */}
          {selectedDateEvents.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  {format(selectedDate, 'EEEE d MMMM', { locale: dateLocale })}
                  <Badge variant="secondary" className="ml-2">
                    {selectedDateEvents.length} événement{selectedDateEvents.length > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDateEvents.map((event) => {
                    const category = event.category ? getCategoryById(event.category) : null;
                    const color = category?.color || EVENT_TYPE_COLORS[event.event_type] || '#6B7280';

                    return (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="p-4 rounded-lg border hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer h-full">
                          <Badge
                            variant="secondary"
                            className="mb-2 text-xs"
                            style={{
                              backgroundColor: `${color}20`,
                              color: color,
                            }}
                          >
                            {event.category ? tCategories(event.category) : event.event_type}
                          </Badge>
                          <h3 className="font-semibold line-clamp-2 mb-2">
                            {getEventTitle(event)}
                          </h3>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              {format(parseISO(event.start_date), 'HH:mm')}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location_name}, {tCities(event.location_city)}
                            </div>
                          </div>
                          <div className="mt-3">
                            <Badge
                              variant="secondary"
                              className={isFreeEvent(event.price) ? 'bg-green-500/10 text-green-600' : ''}
                            >
                              {formatPrice(event.price, locale)}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-secondary" />
                Prochains événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">
                  Aucun événement à venir
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const category = event.category ? getCategoryById(event.category) : null;
                    const color = category?.color || EVENT_TYPE_COLORS[event.event_type] || '#6B7280';
                    const eventDate = parseISO(event.start_date);

                    return (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div
                          className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedDate(eventDate)}
                        >
                          <div className="flex gap-3">
                            {/* Date badge */}
                            <div className="flex flex-col items-center justify-center bg-muted rounded-lg px-2 py-1 min-w-[50px]">
                              <span className="text-xs text-muted-foreground uppercase">
                                {format(eventDate, 'MMM', { locale: dateLocale })}
                              </span>
                              <span className="text-xl font-bold">
                                {format(eventDate, 'd')}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="w-2 h-2 rounded-full mb-1"
                                style={{ backgroundColor: color }}
                              />
                              <h4 className="font-medium text-sm line-clamp-2">
                                {getEventTitle(event)}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(eventDate, 'HH:mm')} · {tCities(event.location_city)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/events">
                  Voir tous les événements
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
