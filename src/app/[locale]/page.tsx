import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  MapPin,
  Music,
  Utensils,
  ArrowRight,
  Palette,
  HeartPulse,
  Users,
  HandHeart,
} from 'lucide-react';
import { EVENT_CATEGORIES, CITIES } from '@/lib/constants';
import { formatPrice, isFreeEvent } from '@/lib/utils';
import { AnimatedCityDisplay } from '@/components/home/AnimatedCityDisplay';
import type { CategoryId } from '@/types';

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  music: Music,
  palette: Palette,
  'heart-pulse': HeartPulse,
  utensils: Utensils,
  users: Users,
  'hand-heart': HandHeart,
};

// Mock events for better empty state
// price: null = free, numeric string = price in FCFA
const mockEvents = [
  {
    id: '1',
    title: 'Concert de Youssou N\'Dour',
    category: 'musique_fete' as CategoryId,
    location: 'Hotel Lamantin Beach, Saly',
    date: 'Samedi 25 Janvier',
    time: '21:00',
    price: '15000',
  },
  {
    id: '2',
    title: 'Marché Artisanal de Somone',
    category: 'marches_food' as CategoryId,
    location: 'Place du Village, Somone',
    date: 'Dimanche 26 Janvier',
    time: '09:00 - 17:00',
    price: null as string | null,
  },
  {
    id: '3',
    title: 'Cours de Yoga au Lever du Soleil',
    category: 'sport_bienetre' as CategoryId,
    location: 'Plage de Ngaparou',
    date: 'Lundi 27 Janvier',
    time: '06:30',
    price: '5000',
  },
];

const featuredCities = [
  { key: 'saly', image: '/images/saly.jpg' },
  { key: 'mbour', image: '/images/mbour.jpg' },
  { key: 'somone', image: '/images/somone.jpg' },
  { key: 'ngaparou', image: '/images/ngaparou.jpg' },
];

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = params as unknown as { locale: string };
  setRequestLocale(resolvedParams.locale);
  const t = useTranslations('home');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');

  return (
    <div className="flex flex-col">
      {/* Hero Section - Improved spacing and typography */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-24 lg:py-40">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedCityDisplay
              cities={CITIES.map((key) => ({ key, label: tCities(key) }))}
              compact
            />
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 mt-4">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base h-12 px-8 w-full sm:w-auto">
                <Link href="/events">
                  {t('ctaExplore')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-12 px-8 w-full sm:w-auto border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <Link href="/events/create">{t('ctaCreate')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Event Categories - 6 main categories */}
      <section className="py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-10">{t('popularCategories')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {EVENT_CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat.icon] || Music;
              return (
                <Link key={cat.id} href={`/events?category=${cat.id}`}>
                  <Card className="card-hover cursor-pointer border">
                    <CardContent className="p-4 md:p-5 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 md:mb-3"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon className="h-5 w-5 md:h-7 md:w-7 text-white" />
                      </div>
                      <span className="font-medium text-xs md:text-sm">{tCategories(cat.id)}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Upcoming Events - With realistic mock data */}
      <section className="py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t('upcomingEvents')}</h2>
            <Button asChild variant="ghost" className="text-secondary hover:text-secondary">
              <Link href="/events">
                Voir tout <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
            {mockEvents.map((event) => {
              const categoryConfig = EVENT_CATEGORIES.find(c => c.id === event.category);
              const Icon = categoryConfig ? (categoryIcons[categoryConfig.icon] || CalendarDays) : CalendarDays;
              const color = categoryConfig?.color || '#FF6B35';
              return (
                <Card key={event.id} className="card-hover overflow-hidden cursor-pointer border group">
                  <div className="relative h-48 placeholder-pattern">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="h-16 w-16 text-muted-foreground/20 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge
                      className="absolute top-3 left-3 gap-1 text-white border-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-3 w-3" />
                      {tCategories(event.category)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`absolute top-3 right-3 ${isFreeEvent(event.price) ? 'bg-green-500 text-white hover:bg-green-500' : ''}`}
                    >
                      {formatPrice(event.price, 'fr')}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{event.date} - {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6 font-light">
              Découvrez tous les événements de la Petite Côte
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/events/create">
                Publier un événement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
