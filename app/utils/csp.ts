// app/utils/csp.ts
/**
 * Content Security Policy (CSP) configuration
 * Protects against XSS attacks while allowing necessary inline scripts
 */

import { headers } from 'next/headers';

/**
 * Generate a cryptographically secure nonce for CSP
 * Use this nonce on inline scripts to allow them through strict CSP
 */
export function generateNonce(): string {
  // In production, this should use crypto.randomBytes or similar
  // Next.js automatically handles nonces in middleware
  return Buffer.from(crypto.randomUUID()).toString('base64');
}

/**
 * Get the current request's nonce from headers
 * This is set by Next.js middleware
 */
export async function getNonce(): Promise<string | undefined> {
  const headersList = await headers();
  return headersList.get('x-nonce') || undefined;
}

/**
 * Build CSP header value with nonce support
 * More secure than 'unsafe-inline' - only scripts with matching nonce execute
 */
export function buildCSP(nonce?: string): string {
  const policies = [
    "default-src 'self'",
    // Script policy - remove unsafe-inline, use nonce for JSON-LD
    nonce
      ? `script-src 'self' 'nonce-${nonce}' https://vercel.live https://va.vercel-scripts.com`
      : "script-src 'self' https://vercel.live https://va.vercel-scripts.com",
    // Style policy - Tailwind requires unsafe-inline (no easy workaround)
    "style-src 'self' 'unsafe-inline'",
    // Font policy
    "font-src 'self' data:",
    // Image policy - restrict to known domains
    "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com",
    // Media policy
    "media-src 'self' data: blob:",
    // Connect policy - API and analytics endpoints
    "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    // Frame policy - YouTube embeds only
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    // Security policies
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return policies.join('; ');
}

/**
 * CSP directives explained:
 * 
 * ✅ SECURE (What we're using):
 * - 'self': Only load from same origin
 * - 'nonce-xxx': Only inline scripts with matching nonce
 * - Specific domains: Only whitelisted external sources
 * 
 * ⚠️ INSECURE (What we removed):
 * - 'unsafe-inline': Allows ANY inline script (XSS risk)
 * - 'unsafe-eval': Allows eval(), Function() (XSS risk)
 * - https:: Allows ANY HTTPS source (too broad)
 */
