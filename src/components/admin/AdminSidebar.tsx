'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/admin/events', label: t('allEvents'), icon: CalendarDays },
    { href: '/admin/events?status=pending', label: t('pendingEvents'), icon: Clock },
    { href: '/admin/users', label: t('users'), icon: Users },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === '/admin';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-4rem)]">
      {/* Admin header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{t('title')}</h2>
            <p className="text-xs text-muted-foreground">Bokkal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick stats legend */}
      <div className="p-4 mt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-3">Statuts</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 text-yellow-500" />
            <span className="text-muted-foreground">{t('status.pending')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">{t('status.approved')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <XCircle className="h-3 w-3 text-red-500" />
            <span className="text-muted-foreground">{t('status.rejected')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
