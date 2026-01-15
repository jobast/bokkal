import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

// Admin route pattern matcher (matches /fr/admin, /en/admin, /wo/admin, /admin)
const adminRoutePattern = /^\/(?:fr|en|wo)?\/admin/;

export async function middleware(request: NextRequest) {
  // Update Supabase session
  const response = await updateSession(request);

  // Check if this is an admin route
  const isAdminRoute = adminRoutePattern.test(request.nextUrl.pathname);

  if (isAdminRoute) {
    // Create Supabase client for admin check
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login if not authenticated
      const locale = request.nextUrl.pathname.match(/^\/(fr|en|wo)/)?.[1] || 'fr';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    // Check admin status in users table
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      // Redirect non-admin users to home
      const locale = request.nextUrl.pathname.match(/^\/(fr|en|wo)/)?.[1] || 'fr';
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  // Run i18n middleware
  const intlResponse = intlMiddleware(request);

  // Merge cookies from Supabase response
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - Static files (e.g. /favicon.ico)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
