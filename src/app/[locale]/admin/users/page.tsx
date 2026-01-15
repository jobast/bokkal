'use client';

import { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleUserAdmin, toggleUserVerified } from '@/lib/actions/admin';
import type { User } from '@/types';

interface UserWithCount extends User {
  events_count: number;
}

export default function AdminUsersPage() {
  const t = useTranslations('admin');

  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter === 'admin') params.set('isAdmin', 'true');
      if (roleFilter === 'verified') params.set('isVerified', 'true');

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();
      setUsers(data.data || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    startTransition(async () => {
      const result = await toggleUserAdmin(userId, isAdmin);
      if (!result.error) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_admin: isAdmin } : u))
        );
      }
    });
  };

  const handleToggleVerified = async (userId: string, isVerified: boolean) => {
    startTransition(async () => {
      const result = await toggleUserVerified(userId, isVerified);
      if (!result.error) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, is_verified: isVerified } : u))
        );
      }
    });
  };

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('users')}</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les utilisateurs et leurs permissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
            <SelectItem value="verified">Vérifiés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Événements</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {user.full_name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {user.full_name || 'Sans nom'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.is_admin && (
                        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.is_verified && (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                      {!user.is_admin && !user.is_verified && (
                        <span className="text-muted-foreground text-sm">Utilisateur</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      {user.events_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.is_verified ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleVerified(user.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Retirer vérification
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleVerified(user.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Vérifier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.is_admin ? (
                          <DropdownMenuItem
                            onClick={() => handleToggleAdmin(user.id, false)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Retirer admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleToggleAdmin(user.id, true)}
                          >
                            <Shield className="h-4 w-4 mr-2 text-purple-500" />
                            Promouvoir admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
