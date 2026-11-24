import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for URL Protection
 * Protects all /admin routes except /admin/login
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes, but allow /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect /admin to /admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin/dashboard
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
