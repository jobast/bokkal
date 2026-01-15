'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarDays,
  Map,
  Menu,
  Plus,
  Home,
  Sparkles,
  User,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/events', label: t('events'), icon: Sparkles },
    { href: '/calendar', label: t('calendar'), icon: CalendarDays },
    { href: '/map', label: t('map'), icon: Map },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm group-hover:shadow-md transition-shadow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col gap-0.5">
              <span className="font-bold text-xl tracking-tight">
                Bokkal
              </span>
              <span className="text-[11px] text-muted-foreground tracking-widest uppercase">
                Petite Côte
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Button asChild size="sm" className="hidden sm:flex h-9 px-4">
              <Link href="/events/create">
                <Plus className="h-4 w-4 mr-1.5" />
                {t('createEvent')}
              </Link>
            </Button>

            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden sm:flex h-9 gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[100px] truncate">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          {t('profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/settings" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Paramètres
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <Shield className="h-4 w-4 mr-2" />
                              {t('admin')}
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500 focus:text-red-500">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="outline" size="sm" className="hidden sm:flex h-9 px-4 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                    <Link href="/auth/login">
                      <User className="h-4 w-4 mr-1.5" />
                      {t('login')}
                    </Link>
                  </Button>
                )}
              </>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-sm">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-xl tracking-tight">Bokkal</span>
                    <span className="text-[11px] text-muted-foreground tracking-widest uppercase">
                      Petite Côte
                    </span>
                  </div>
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="border-t border-border my-2" />
                  <Link
                    href="/events/create"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg bg-primary text-primary-foreground"
                  >
                    <Plus className="h-5 w-5" />
                    {t('createEvent')}
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg border border-border"
                      >
                        <User className="h-5 w-5" />
                        {t('profile')}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg border border-border bg-primary/5"
                        >
                          <Shield className="h-5 w-5" />
                          {t('admin')}
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg text-red-500 hover:bg-red-500/10 w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg border border-border"
                    >
                      <User className="h-5 w-5" />
                      {t('login')}
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
