'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import type { User as UserType } from '@/types';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .single();

    if (data) {
      const profileData = data as UserType;
      setProfile(profileData);
      setFullName(profileData.full_name || '');
      setPhone(profileData.phone || '');
    }

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();

    const { error } = await (supabase
      .from('users') as ReturnType<typeof supabase.from>)
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
      } as never)
      .eq('id', user!.id);

    if (error) {
      setMessage({ type: 'error', text: t('updateError') });
    } else {
      setMessage({ type: 'success', text: t('updateSuccess') });
      // Update local state
      setProfile((prev) =>
        prev ? { ...prev, full_name: fullName.trim() || null, phone: phone.trim() || null } : null
      );
    }

    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    // For now, just sign out. Full account deletion would require more complex logic
    // including deleting all user data and the auth user.
    await signOut();
    router.push('/');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => router.push('/profile')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('backToProfile')}
        </Button>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profileSettings')}</CardTitle>
            <CardDescription>{t('profileDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">{t('emailCantChange')}</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Save Button */}
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t('saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500">{t('dangerZone')}</CardTitle>
            <CardDescription>{t('dangerDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t('deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('deleteConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t('deleteConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
