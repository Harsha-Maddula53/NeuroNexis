import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api');
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Create response to allow adding headers
  const response = NextResponse.next();

  // 1. Centralized Auth Gating for /(app)/* or generally non-public UI and protected API routes
  if (!isPublicRoute) {
    if (process.env.PLAYWRIGHT_TEST === '1' && request.headers.get('x-test-bypass') === 'true') {
      // Allow test suite to bypass middleware auth
    } else if (pathname.startsWith('/api/auth')) {
      // let it pass
    } else {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token) {
        if (isApiRoute) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Redirect to login for protected pages
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(url);
      }
    }
  }

  // 2. Add Security Headers
  const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https: wss:;",
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
