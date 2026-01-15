'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Settings,
  Plus,
  CheckCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import type { Event, User as UserType } from '@/types';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfileData();
    }
  }, [user, authLoading]);

  const fetchProfileData = async () => {
    const supabase = createClient();

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (profileData) {
      setProfile(profileData as UserType);
    }

    // Fetch user's events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (eventsData) {
      setEvents(eventsData as Event[]);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const pendingCount = events.filter((e) => e.status === 'pending').length;
  const approvedCount = events.filter((e) => e.status === 'approved').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.full_name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {profile.full_name || t('anonymous')}
                  </h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {profile.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('verified')}
                      </Badge>
                    )}
                    {profile.is_admin && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-muted-foreground mb-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {t('memberSince')}{' '}
                      {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('editProfile')}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{events.length}</div>
              <div className="text-sm text-muted-foreground">{t('totalEvents')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-500">{approvedCount}</div>
              <div className="text-sm text-muted-foreground">{t('approvedEvents')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">{t('pendingEvents')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('myEvents')}</CardTitle>
            <Button asChild size="sm">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('createEvent')}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noEvents')}</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/events/create">{t('createFirstEvent')}</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {event.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.start_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tCities(event.location_city)}
                        </span>
                      </div>
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
