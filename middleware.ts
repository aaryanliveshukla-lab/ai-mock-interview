import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const publicPaths = ['/login', '/register'];
  const protectedPaths = ['/dashboard', '/interview', '/profile', '/history', '/templates', '/admin', '/coding', '/career-coach'];

  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicAuthRoute = publicPaths.some(path => pathname.startsWith(path));

  if (!token) {
    if (isProtectedRoute) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (isProtectedRoute) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(url);
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    if (isPublicAuthRoute) {
      const response = NextResponse.next();
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    return NextResponse.next();
  }

  if (isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
