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
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Redirect /admin to /admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Protect /account and /track-order routes
  if (pathname === '/account' || pathname === '/track-order') {
    const customerToken = request.cookies.get('customer_token')?.value;
    if (!customerToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
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
  matcher: ['/admin/:path*', '/account', '/account/:path*', '/track-order', '/track-order/:path*'],
};
