'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EventStatusBadge } from '@/components/admin/EventStatusBadge';
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { approveEvent, rejectEvent, deleteEvent } from '@/lib/actions/events';
import { EVENT_CATEGORIES, CITIES, getCategoryById } from '@/lib/constants';
import type { Event, EventStatus } from '@/types';

interface EventWithUser extends Omit<Event, 'user'> {
  user?: {
    id: string;
    full_name: string | null;
    email?: string;
    is_verified: boolean;
    is_admin: boolean;
  };
}

function AdminEventsContent() {
  const t = useTranslations('admin');
  const tCategories = useTranslations('events.categories');
  const tCities = useTranslations('cities');
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>(
    (searchParams.get('status') as EventStatus) || 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject' | 'delete';
    event: EventWithUser;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [statusFilter, categoryFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      const data = await response.json();
      setEvents(data.data || []);
    } catch {
      setEvents([]);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!actionDialog?.event) return;
    startTransition(async () => {
      const result = await approveEvent(actionDialog.event.id);
      if (!result.error) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === actionDialog.event.id ? { ...e, status: 'approved' as EventStatus } : e
          )
        );
      }
      setActionDialog(null);
    });
  };

  const handleReject = async () => {
    if (!actionDialog?.event) return;
    startTransition(async () => {
      const result = await rejectEvent(actionDialog.event.id, rejectReason);
      if (!result.error) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === actionDialog.event.id ? { ...e, status: 'rejected' as EventStatus } : e
          )
        );
      }
      setActionDialog(null);
      setRejectReason('');
    });
  };

  const handleDelete = async () => {
    if (!actionDialog?.event) return;
    startTransition(async () => {
      const result = await deleteEvent(actionDialog.event.id);
      if (!result.error) {
        setEvents((prev) => prev.filter((e) => e.id !== actionDialog.event.id));
      }
      setActionDialog(null);
    });
  };

  const filteredEvents = events.filter((event) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.location_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('allEvents')}</h1>
        <p className="text-muted-foreground mt-1">
          Gérez et validez les événements soumis
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as EventStatus | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">{t('status.pending')}</SelectItem>
            <SelectItem value="approved">{t('status.approved')}</SelectItem>
            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {EVENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {tCategories(cat.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Organisateur</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun événement trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => {
                const category = getCategoryById(event.category || '');
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {event.title}
                    </TableCell>
                    <TableCell>
                      {category && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            borderColor: `${category.color}40`,
                          }}
                        >
                          {tCategories(category.id)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{tCities(event.location_city)}</TableCell>
                    <TableCell>
                      {new Date(event.start_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <EventStatusBadge status={event.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {event.user?.full_name || 'Anonyme'}
                        </span>
                        {event.user?.is_verified && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isPending}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/events/${event.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          {event.status !== 'approved' && (
                            <DropdownMenuItem
                              onClick={() => setActionDialog({ type: 'approve', event })}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Approuver
                            </DropdownMenuItem>
                          )}
                          {event.status !== 'rejected' && (
                            <DropdownMenuItem
                              onClick={() => setActionDialog({ type: 'reject', event })}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-yellow-500" />
                              Rejeter
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setActionDialog({ type: 'delete', event })}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approve Dialog */}
      <AlertDialog
        open={actionDialog?.type === 'approve'}
        onOpenChange={() => setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmApprove')}</AlertDialogTitle>
            <AlertDialogDescription>
              L'événement "{actionDialog?.event.title}" sera visible au public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog
        open={actionDialog?.type === 'reject'}
        onOpenChange={() => {
          setActionDialog(null);
          setRejectReason('');
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmReject')}</AlertDialogTitle>
            <AlertDialogDescription>
              L'événement "{actionDialog?.event.title}" ne sera pas publié.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={t('rejectReason')}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isPending}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={actionDialog?.type === 'delete'}
        onOpenChange={() => setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'événement "{actionDialog?.event.title}"
              sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <AdminEventsContent />
    </Suspense>
  );
}
