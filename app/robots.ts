/**
 * Dynamic Robots.txt Generation
 * Next.js 15 best practice for dynamic robots configuration
 */

import { SITE_CONFIG } from '@/app/config/site';

// Robots configuration type for Next.js 15
interface Robots {
  rules: {
    userAgent?: string;
    allow?: string | string[];
    disallow?: string | string[];
    crawlDelay?: number;
  }[];
  sitemap?: string | string[];
  host?: string;
}

export default function robots(): Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/search?*',
        '/private/'
      ],
      crawlDelay: 1
    }],
    sitemap: `${baseUrl}/sitemap-index.xml`,
    host: baseUrl
  };
}