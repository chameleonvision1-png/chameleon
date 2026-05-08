import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff2)).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Check if it's the khawarizm subdomain
  if (hostname.startsWith('khawarizm.')) {
    return NextResponse.rewrite(new URL(`/khawarizm${url.pathname}`, req.url));
  }

  // Check if it's the sync subdomain
  if (hostname.startsWith('sync.')) {
    return NextResponse.rewrite(new URL(`/sync${url.pathname}`, req.url));
  }

  // Optional: Prevent direct access to /khawarizm or /sync from the main domain
  if (url.pathname.startsWith('/khawarizm') || url.pathname.startsWith('/sync')) {
    // If they access chameleon.vision/khawarizm directly, redirect them to the home page or 404
    // Uncomment the following line if you want to force subdomain usage strictly:
    // return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
