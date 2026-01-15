import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { EventFilters } from '@/components/events/EventFilters';
import { EventCard } from '@/components/events/EventCard';
import { Plus, CalendarDays } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Event } from '@/types';

async function getApprovedEvents(): Promise<Event[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .gte('start_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return (data || []) as Event[];
}

async function EventsList() {
  const t = await getTranslations('events');
  const events = await getApprovedEvents();

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground text-lg mb-4">{t('noEvents')}</p>
        <Button asChild>
          <Link href="/events/create">{t('create')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('events');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="h-4 w-4 mr-2" />
            {t('create')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-lg" />}>
          <EventFilters />
        </Suspense>
      </div>

      {/* Events list */}
      <Suspense fallback={<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>}>
        <EventsList />
      </Suspense>
    </div>
  );
}
