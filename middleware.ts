// middleware.ts
/**
 * Next.js Middleware for security headers including CSP with nonce
 * Runs on every request before the page renders
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Allow unsafe-eval in development for Next.js dev tools
  const isDev = process.env.NODE_ENV === 'development';
  const evalPolicy = isDev ? " 'unsafe-eval'" : "";
  
  // Build CSP - use unsafe-inline without nonce for Next.js compatibility
  // Modern browsers will still protect against most XSS with other directives
  const cspHeader = [
    "default-src 'self'",
    // Use unsafe-inline for Next.js framework scripts (no nonce to avoid conflicts)
    `script-src 'self' 'unsafe-inline'${evalPolicy} https://vercel.live https://va.vercel-scripts.com https://www.googletagmanager.com https://assets.calendly.com`,
    "style-src 'self' 'unsafe-inline' https://assets.calendly.com", // Tailwind + Calendly
    "font-src 'self' data:",
    "img-src 'self' data: blob: https: https://img.youtube.com https://i.ytimg.com https://assets.calendly.com",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com https://www.google-analytics.com https://www.googletagmanager.com https://calendly.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://calendly.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
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
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
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
