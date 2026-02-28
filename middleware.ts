// middleware.ts
/**
 * Next.js Middleware for security headers including CSP with nonce
 * Runs on every request before the page renders
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATH_PREFIXES = ['/social-dashboard', '/api/social'];
const AUTH_EXEMPT_PATHS = ['/api/social/linkedin/callback'];

function isProtectedPath(pathname: string): boolean {
  if (AUTH_EXEMPT_PATHS.some((path) => pathname === path)) {
    return false;
  }

  return PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Z-Beam Social Dashboard"'
    }
  });
}

function isAuthorized(request: NextRequest): boolean {
  const username = process.env.SOCIAL_DASHBOARD_USERNAME;
  const password = process.env.SOCIAL_DASHBOARD_PASSWORD;

  if (!username || !password) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    return false;
  }

  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const separatorIndex = decodedCredentials.indexOf(':');

  if (separatorIndex < 0) {
    return false;
  }

  const providedUser = decodedCredentials.slice(0, separatorIndex);
  const providedPass = decodedCredentials.slice(separatorIndex + 1);

  return providedUser === username && providedPass === password;
}

export function middleware(request: NextRequest) {
  if (isProtectedPath(request.nextUrl.pathname) && !isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const isThankYouPath = request.nextUrl.pathname === '/thank-you' || request.nextUrl.pathname.startsWith('/thank-you/');
  const frameAncestorsPolicy = isThankYouPath ? "'self'" : "'none'";
  const frameOptionsPolicy = isThankYouPath ? 'SAMEORIGIN' : 'DENY';

  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Allow unsafe-eval in development for Next.js dev tools
  const isDev = process.env.NODE_ENV === 'development';
  const evalPolicy = isDev ? " 'unsafe-eval'" : "";
  
  // In development, use a more permissive CSP for easier debugging
  const cspHeader = isDev ? [
    "default-src 'self' https: http:",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:`,
    "style-src 'self' 'unsafe-inline' https: http:",
    "font-src 'self' data: https: http:",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob: https: http:",
    "connect-src 'self' https: http: ws: wss:",
    "frame-src 'self' https: http:",
    `frame-ancestors ${frameAncestorsPolicy}`,
    "form-action 'self' https: http:",
    "base-uri 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
  ].join('; ') : [
    // Production CSP - more restrictive
    "default-src 'self' https://st.sendajob.com",
    `script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://online-booking.workiz.com https://st.sendajob.com https://*.sendajob.com`,
    "style-src 'self' 'unsafe-inline' https://online-booking.workiz.com https://st.sendajob.com https://*.sendajob.com",
    "font-src 'self' data: https://st.sendajob.com https://*.sendajob.com",
    "img-src 'self' data: blob: https: https://img.youtube.com https://i.ytimg.com https://online-booking.workiz.com https://st.sendajob.com https://*.sendajob.com",
    "media-src 'self' data: blob: https://st.sendajob.com https://*.sendajob.com",
    "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://www.googletagmanager.com https://www.googleadservices.com https://stats.g.doubleclick.net https://online-booking.workiz.com https://app.workiz.com https://st.sendajob.com https://*.sendajob.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://online-booking.workiz.com https://st.sendajob.com https://*.sendajob.com",
    `frame-ancestors ${frameAncestorsPolicy}`,
    "form-action 'self' https://st.sendajob.com https://*.sendajob.com",
    "base-uri 'self'",
    "object-src 'none'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join('; ');

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', frameOptionsPolicy);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(self "https://online-booking.workiz.com"), microphone=(self "https://online-booking.workiz.com"), geolocation=(self "https://online-booking.workiz.com"), interest-cohort=()'
  );
  
  // Cross-Origin Policies - relaxed for YouTube embeds
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  // Note: COEP require-corp blocks YouTube iframes, so we use unsafe-none
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, manifest.json
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|images/).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
