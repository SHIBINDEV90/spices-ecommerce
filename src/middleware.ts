import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'fallback_secret' });

  // Protect all /admin routes, but allow access to /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    // Role-based protection: Only Admins can access /admin
    if (token.role !== 'Admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect checkout and order routes (both pages and APIs)
  if (pathname.startsWith('/checkout') || pathname.startsWith('/api/checkout') || pathname.startsWith('/api/order')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized. Please log in to continue.' }, { status: 401 });
      }
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/api/checkout/:path*', '/api/order/:path*'],
};
