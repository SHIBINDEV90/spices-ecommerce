import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper to construct absolute URLs using the public domain under a reverse proxy.
function getPublicUrl(targetUrlOrPath: string, request: NextRequest): string {
  const host = request.headers.get('host') || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  // If running locally, bypass NEXTAUTH_URL unless we are behind a proxy that sets x-forwarded-host
  let baseUrl = isLocal ? null : process.env.NEXTAUTH_URL;

  // Fallback to forwarded headers if NEXTAUTH_URL is not set or we are running locally
  if (!baseUrl) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
      baseUrl = `${forwardedProto}://${forwardedHost}`;
    } else {
      const proto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', ''));
      baseUrl = `${proto}://${host}`;
    }
  }

  if (baseUrl) {
    try {
      const baseParsed = new URL(baseUrl);
      // Strip ports for production domains
      if (baseParsed.hostname !== 'localhost' && baseParsed.hostname !== '127.0.0.1') {
        baseUrl = `${baseParsed.protocol}//${baseParsed.hostname}`;
      }
    } catch (e) {
      // Ignore
    }
  }

  if (baseUrl) {
    try {
      const baseParsed = new URL(baseUrl);
      if (targetUrlOrPath.startsWith('http://') || targetUrlOrPath.startsWith('https://')) {
        const targetParsed = new URL(targetUrlOrPath);
        targetParsed.protocol = baseParsed.protocol;
        targetParsed.host = baseParsed.host;
        return targetParsed.toString();
      } else {
        return new URL(targetUrlOrPath, baseParsed).toString();
      }
    } catch (e) {
      // Ignore and fallback
    }
  }

  // Fallback to request.url
  return new URL(targetUrlOrPath, request.url).toString();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'fallback_secret' });

  // Protect all /admin routes, but allow access to /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const url = new URL(getPublicUrl('/admin/login', request));
      url.searchParams.set('callbackUrl', getPublicUrl(request.url, request));
      return NextResponse.redirect(url);
    }

    // Role-based protection: Only Admins can access /admin
    if (token.role !== 'Admin') {
      const url = new URL(getPublicUrl('/admin/login', request));
      url.searchParams.set('callbackUrl', getPublicUrl(request.url, request));
      return NextResponse.redirect(url);
    }
  }

  // Protect checkout and order routes (both pages and APIs)
  if (pathname.startsWith('/checkout') || pathname.startsWith('/api/checkout') || pathname.startsWith('/api/order')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized. Please log in to continue.' }, { status: 401 });
      }
      const url = new URL(getPublicUrl('/login', request));
      url.searchParams.set('callbackUrl', getPublicUrl(request.url, request));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/api/checkout/:path*', '/api/order/:path*'],
};
