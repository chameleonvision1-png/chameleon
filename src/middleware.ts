import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff2)).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Check if it's the khawarizm subdomain
  if (hostname.startsWith('khawarizm.')) {
    if (!url.pathname.startsWith('/khawarizm')) {
      response = NextResponse.rewrite(new URL(`/khawarizm${url.pathname}`, req.url));
    }
  }

  // Check if it's the sync subdomain
  if (hostname.startsWith('sync.')) {
    if (!url.pathname.startsWith('/sync')) {
      response = NextResponse.rewrite(new URL(`/sync${url.pathname}`, req.url));
    }
  }

  // Optional: Prevent direct access to /khawarizm or /sync from the main domain
  if (url.pathname.startsWith('/khawarizm') || url.pathname.startsWith('/sync')) {
    // If they access chameleon.vision/khawarizm directly, redirect them to the home page or 404
    // Uncomment the following line if you want to force subdomain usage strictly:
    // return NextResponse.redirect(new URL('/', req.url));
  }

  // Refresh Supabase session for SYNC routes
  // This ensures the auth token stays fresh on every request
  const isSyncRoute = hostname.startsWith('sync.') || url.pathname.startsWith('/sync');

  if (isSyncRoute && process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL && process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SYNC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SYNC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    // This refreshes the session if expired
    await supabase.auth.getUser();
  }

  return response;
}
