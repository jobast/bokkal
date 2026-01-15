import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { CalendarDays, Users, Clock, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/components/admin/StatsCard';
import { getAdminStats } from '@/lib/admin/queries';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return {
    title: t('dashboard'),
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de l'activité sur Bokkal
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total événements"
          value={stats.totalEvents}
          icon={CalendarDays}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="En attente"
          value={stats.pendingEvents}
          icon={Clock}
          iconClassName="bg-yellow-500/10 text-yellow-500"
        />
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          title="Utilisateurs vérifiés"
          value={stats.verifiedUsers}
          icon={CheckCircle}
          iconClassName="bg-green-500/10 text-green-500"
        />
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <a
              href="/admin/events?status=pending"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Événements en attente</p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingEvents} événement(s) à valider
                </p>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Gérer les utilisateurs</p>
                <p className="text-sm text-muted-foreground">
                  Promouvoir, vérifier ou gérer les comptes
                </p>
              </div>
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-border p-6">
          <h2 className="font-semibold mb-4">Informations</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">Système de validation</h3>
              <p className="text-muted-foreground mt-1">
                Les événements créés par des utilisateurs vérifiés ou admins sont automatiquement approuvés. Les autres nécessitent une validation manuelle.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Devenir vérifié</h3>
              <p className="text-muted-foreground mt-1">
                Vous pouvez manuellement vérifier un utilisateur depuis la page de gestion des utilisateurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
