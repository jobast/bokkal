'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { EVENT_CATEGORIES, CITIES } from '@/lib/constants';
import type { CategoryId, City } from '@/types';

export function EventFilters() {
  const t = useTranslations('events.filters');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') as CategoryId | null;
  const currentCity = searchParams.get('city') as City | null;
  const currentDate = searchParams.get('date');
  const currentSearch = searchParams.get('search') || '';

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = currentCategory || currentCity || currentDate || currentSearch;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un événement..."
          className="pl-10"
          value={currentSearch}
          onChange={(e) => updateFilters('search', e.target.value || null)}
        />
      </div>

      {/* Filter selects */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        <Select
          value={currentCategory || 'all'}
          onValueChange={(value) => updateFilters('category', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('allTypes')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTypes')}</SelectItem>
            {EVENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {tCategories(cat.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* City filter */}
        <Select
          value={currentCity || 'all'}
          onValueChange={(value) => updateFilters('city', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('allCities')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCities')}</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {tCities(city)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date filter */}
        <Select
          value={currentDate || 'all'}
          onValueChange={(value) => updateFilters('date', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('allDates')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allDates')}</SelectItem>
            <SelectItem value="today">{t('today')}</SelectItem>
            <SelectItem value="tomorrow">{t('tomorrow')}</SelectItem>
            <SelectItem value="this_week">{t('thisWeek')}</SelectItem>
            <SelectItem value="this_month">{t('thisMonth')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
