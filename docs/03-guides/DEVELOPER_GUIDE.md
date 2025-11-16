# Z-Beam Developer Guide - Modern Web Standards Implementation

## Architecture Overview

Z-Beam is built using modern web technologies with a focus on performance, accessibility, and maintainability. This comprehensive guide covers all technical implementation details for developers working on the project.

## Technology Stack

### Core Framework
- **Next.js 14.2.32**: React framework with App Router
- **React 18**: Component-based UI library with concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework with dark mode

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Testing framework with React Testing Library
- **React Testing Library**: Component testing utilities

### Production Infrastructure
- **Vercel**: Deployment and hosting platform
- **Edge Runtime**: Serverless function execution
- **CDN**: Global content delivery network
- **PWA**: Progressive Web App capabilities

## Project Structure

```
z-beam/
├── app/                    # Next.js App Router directory
│   ├── components/         # Reusable React components
│   │   ├── Navigation/     # Navigation components (nav.tsx, footer.tsx)
│   │   ├── Contact/        # Contact form and info components
│   │   ├── Hero/          # Hero section components
│   │   ├── Caption/       # Caption and media components
│   │   └── ErrorBoundary/ # Error handling components
│   ├── [slug]/            # Dynamic route handling
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── services/          # Services page
│   ├── utils/             # Utility functions and constants
│   ├── css/               # Global styles
│   └── layout.tsx         # Root layout component
├── public/                # Static assets
│   ├── images/            # Image assets
│   ├── favicon/           # Favicon files
│   ├── manifest.json      # PWA manifest
│   └── robots.txt         # SEO robots file
├── tests/                 # Test files
│   └── components/        # Component accessibility tests (74 tests)
├── docs/                  # Documentation
│   ├── WEB_STANDARDS_COMPLIANCE.md
│   ├── ACCESSIBILITY_GUIDE.md
│   └── DEVELOPER_GUIDE.md
├── types/                 # TypeScript type definitions
└── scripts/               # Build and deployment scripts
```

## Accessibility Implementation (WCAG 2.1 AA)

### Component-Level Accessibility

#### Skip Links
Every page includes skip links for keyboard navigation:

```tsx
// Implemented in layout and navigation components
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white p-2 rounded"
>
  Skip to main content
</a>
```

#### Navigation Accessibility (`app/components/Navigation/nav.tsx`)
```tsx
interface NavProps {
  className?: string;
}

export function Navbar({ className }: NavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className={`bg-gray-800 border-b border-gray-700 ${className}`} role="navigation" aria-label="Main navigation">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
      
      {/* Mobile menu button with proper ARIA */}
      <button
        className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Mobile menu with proper ARIA */}
      <div 
        id="mobile-menu" 
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        role="menu"
        aria-labelledby="mobile-menu-button"
      >
        {/* Navigation links with proper focus management */}
      </div>
    </nav>
  );
}
```

**Key Features:**
- Responsive design with mobile hamburger menu
- ARIA labels and states for screen readers
- Keyboard navigation with proper focus management
- Skip links for efficient navigation

#### Form Accessibility (`app/components/Contact/ContactForm.tsx`)
```tsx
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '', email: '', phone: '', message: ''
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Accessible form input pattern */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-200">
          Email Address <span className="text-red-400" aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          aria-describedby="email-error email-help"
          aria-invalid={errors.email ? 'true' : 'false'}
          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100"
          value={formData.email}
          onChange={handleChange}
        />
        <div id="email-help" className="text-sm text-gray-400 mt-1">
          We'll never share your email with anyone else.
        </div>
        {errors.email && (
          <div id="email-error" role="alert" aria-live="polite" className="text-red-400 text-sm mt-1">
            {errors.email}
          </div>
        )}
      </div>
      
      {/* Submit button with loading state */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-describedby="submit-status"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="sr-only">Sending message...</span>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" aria-hidden="true">
              {/* Loading spinner */}
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
}
```

**Features:**
- Proper label association with htmlFor and id
- ARIA descriptions for help text and errors
- Live regions for dynamic error messages
- Loading states with screen reader announcements

### Accessibility Testing

#### Test Structure (74 Tests Passing)
```typescript
// tests/components/Navigation.accessibility.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Navbar } from '@/app/components/Navigation/nav';

expect.extend(toHaveNoViolations);

describe('Navigation Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('skip link should be present and functional', async () => {
    render(<Navbar />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    
    await user.tab();
    expect(screen.getByText('Skip to main content')).toHaveFocus();
    
    await user.tab();
    expect(screen.getByText('Home')).toHaveFocus();
  });

  test('mobile menu button should have proper ARIA attributes', () => {
    render(<Navbar />);
    const mobileButton = screen.getByLabelText(/navigation menu/i);
    expect(mobileButton).toHaveAttribute('aria-expanded');
    expect(mobileButton).toHaveAttribute('aria-controls', 'mobile-menu');
  });
});
```

## Progressive Web App (PWA) Implementation

### Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Z-Beam Laser Cleaning",
  "short_name": "Z-Beam",
  "description": "Professional media production and event services",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#374151",
  "theme_color": "#1f2937",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en",
  "dir": "ltr",
  "categories": ["business", "productivity", "photo"],
  "icons": [
    {
      "src": "/images/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/images/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Services",
      "short_name": "Services",
      "description": "View our production services",
      "url": "/services",
      "icons": [{"src": "/images/icons/services-96x96.png", "sizes": "96x96"}]
    },
    {
      "name": "Contact",
      "short_name": "Contact",
      "description": "Get in touch with our team",
      "url": "/contact",
      "icons": [{"src": "/images/icons/contact-96x96.png", "sizes": "96x96"}]
    }
  ],
  "screenshots": [
    {
      "src": "/images/screenshots/desktop-home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Z-Beam homepage on desktop"
    },
    {
      "src": "/images/screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Z-Beam homepage on mobile"
    }
  ]
}
```

### Service Worker (Planned Implementation)
```typescript
// public/sw.js
const CACHE_NAME = 'z-beam-v1';
const urlsToCache = [
  '/',
  '/about',
  '/services',
  '/contact',
  '/css/global.css',
  '/images/hero-bg.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
```

## Security Implementation

### Comprehensive Security Headers (`next.config.js`)
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https:",
            "media-src 'self' data: blob:",
            "connect-src 'self' https://vercel.live https://vitals.vercel-insights.com",
            "frame-ancestors 'none'",
            "form-action 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests"
          ].join('; ')
        },
        // Frame protection
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        // MIME type protection
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        // HTTPS enforcement
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
        // Referrer policy
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        // XSS protection
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        // Permissions policy
        {
          key: 'Permissions-Policy',
          value: [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'interest-cohort=()',
            'payment=()',
            'usb=()'
          ].join(', ')
        }
      ]
    }
  ];
}
```

### Input Sanitization and Validation
```typescript
// utils/validation.ts
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove HTML characters
    .substring(0, 1000); // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
}
```

## SEO Infrastructure

### Enhanced Metadata (`app/layout.tsx`)
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    template: `%s | ${SITE_CONFIG.name}`,
    default: SITE_CONFIG.name,
  },
  description: SITE_CONFIG.description,
  keywords: "media production, video production, event services, professional photography",
  authors: [{ name: "Z-Beam" }],
  creator: "Z-Beam",
  publisher: "Z-Beam",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Z-Beam - Professional Laser Cleaning Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ['/images/twitter-card.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/Favicon/favicon-350.png', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icons/apple-touch-icon.png' },
    ],
  },
}
```

### Robots.txt (`public/robots.txt`)
```txt
# Z-Beam Robots.txt
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://www.z-beam.com/sitemap.xml

# Specific crawler directives
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Block unnecessary crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
```

## Performance Optimization

### Bundle Optimization (`next.config.js`)
```javascript
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
          maxSize: 244000 // 244KB
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
          maxSize: 244000
        },
        framework: {
          chunks: 'all',
          name: 'framework',
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
          priority: 40,
          enforce: true,
        }
      }
    };
  }
  return config;
}
```

### Image Optimization
```javascript
// next.config.js
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  unoptimized: true, // For development
  dangerouslyAllowSVG: true,
}
```

### Resource Hints (Planned)
```tsx
// In layout.tsx head section
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
  <link rel="dns-prefetch" href="https://vercel.live" />
  <link rel="preload" href="/images/hero-bg.webp" as="image" type="image/webp" />
  <link rel="preload" href="/css/global.css" as="style" />
</head>
```

## Dark Theme Implementation

### Tailwind Configuration (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### Dark Theme CSS Classes
```css
/* app/css/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  /* Enhanced focus styles for accessibility */
  .focus-visible:focus {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50;
  }
  
  .form-input {
    @apply w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-100;
  }
}
```

## Testing Strategy

### Test Configuration (`jest.config.js`)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### Running Tests
```bash
# All accessibility tests (74 tests)
npm test -- --testNamePattern="accessibility"

# Specific component tests
npm test -- --testNamePattern="Navigation"

# Coverage report
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

### Test Coverage Results
```
✅ Navigation: 18 accessibility tests passing
✅ Contact: 22 accessibility tests passing  
✅ Hero: 11 accessibility tests passing
✅ Caption: 15 accessibility tests passing
✅ Author: 4 accessibility tests passing
✅ Tags: 4 accessibility tests passing
Total: 74 tests passing
```

## Development Workflow

### Code Quality Tools
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format

# Pre-commit checks
npm run pre-commit
```

### Build Process
```bash
# Development server
npm run dev

# Production build
npm run build

# Bundle analysis
npm run analyze

# Preview production build
npm run start
```

### Deployment Commands
```bash
# Deploy to Vercel production
vercel --prod

# Preview deployment
vercel

# Deploy with monitoring
./deploy-prod.sh
```

## Monitoring and Analytics

### Performance Monitoring
```typescript
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased flex flex-col min-h-screen bg-gray-700 text-gray-100">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Error Boundaries
```typescript
// app/components/ErrorBoundary/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2>Something went wrong in {this.props.componentName}</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Environment Configuration

### Development Environment
```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=localhost:3000
NODE_ENV=development
```

### Production Environment Variables
```bash
# Set in Vercel dashboard
NEXT_PUBLIC_SITE_URL=https://www.z-beam.com
NODE_ENV=production
VERCEL_ENV=production
```

## Maintenance Guidelines

### Regular Updates
- **Dependencies**: Weekly security updates via `npm audit`
- **Framework**: Quarterly major version updates
- **Testing**: Continuous integration with every commit
- **Accessibility**: Monthly accessibility audits with axe-core

### Performance Monitoring
- **Core Web Vitals**: Lighthouse CI in deployment pipeline
- **Bundle Size**: Monitor with `@next/bundle-analyzer`
- **Performance Budget**: 244KB per chunk maximum
- **Image Optimization**: WebP/AVIF format usage

### Security Practices
- **Dependency Scanning**: `npm audit` in CI/CD pipeline
- **Security Headers**: Regular CSP validation
- **Input Validation**: Server-side validation for all inputs
- **Regular Reviews**: Quarterly security assessments

## Future Enhancements

### Planned Features
- **Service Worker**: Complete offline functionality
- **Push Notifications**: User engagement features
- **Advanced PWA**: Background sync and app shortcuts
- **Performance**: Resource hints and advanced caching

### Standards Evolution
- **WCAG 3.0**: Prepare for next-generation accessibility guidelines
- **PWA Updates**: Keep up with latest PWA standards
- **Security**: Implement additional security measures
- **Performance**: Core Web Vitals optimization

---

## Quick Reference

### Key Commands
```bash
# Development
npm run dev              # Start development server
npm test                 # Run test suite
npm run lint            # Check code quality

# Building
npm run build           # Production build
npm run start           # Start production server

# Testing
npm test -- --testNamePattern="accessibility"  # Run accessibility tests
npm run test:coverage   # Generate coverage report

# Deployment
vercel --prod           # Deploy to production
```

### File Locations
- **Components**: `app/components/`
- **Styles**: `app/css/global.css`
- **Tests**: `tests/components/`
- **Public Assets**: `public/`
- **Documentation**: `docs/`

### Important URLs
- **Development**: `http://localhost:3000`
- **Production**: `https://www.z-beam.com`
- **Repository**: `https://github.com/Air2air/z-beam`

---

*This developer guide is maintained alongside the codebase. Last updated: September 22, 2025*
