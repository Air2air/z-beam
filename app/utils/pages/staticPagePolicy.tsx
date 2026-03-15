import type { ReactNode } from 'react';
import Link from 'next/link';

import { ContactLeadSection } from '@/app/components/Contact/ContactLeadSection';
import { SITE_CONFIG } from '@/app/config/site';
import type { ClickableCardProps } from '@/app/components/ClickableCard';
import {
  getSharedStaticPageEntry,
  type PageArchitecture,
  type SharedStaticPageKey,
} from '@/app/utils/pages/staticPageRegistry';
import type { StaticPageFrontmatter } from '@/app/utils/staticPageLoader';

export const SERVICES_HUB_PATH = '/services';

export type StaticPageType = SharedStaticPageKey;

export interface DynamicFeature {
  type: 'clickable-cards' | 'header-cta' | 'custom-section';
  placement?: 'right-sidebar' | 'left-sidebar' | 'inline';
  config?: Record<string, unknown>;
}

export interface EnhancedStaticPageFrontmatter extends StaticPageFrontmatter {
  pageType?: PageArchitecture;
  dynamicFeatures?: DynamicFeature[];
  clickableCards?: ClickableCardProps[];
  headerCTA?: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'brand';
  };
  sections?: any[];
}

export interface StaticPageConfig {
  hasComparison?: boolean;
  comparisonData?: () => Promise<any>;
  comparisonHighlight?: string;
  renderSupplementalContent?: (frontmatter: EnhancedStaticPageFrontmatter) => ReactNode;
}

export const STATIC_PAGE_ROUTE_POLICY = {
  servicesHub: SERVICES_HUB_PATH,
  genericServiceNavigation: SERVICES_HUB_PATH,
} as const;

export const PAGE_CONFIGS: Record<StaticPageType, StaticPageConfig> = {
  contact: {
    renderSupplementalContent: () => <ContactLeadSection />,
  },
  'thank-you': {
  },
  about: {
  },
  partners: {
  },
  equipment: {
  },
  compliance: {
  },
  comparison: {
    hasComparison: true,
    comparisonData: () => import('@/data/comparison-methods.json'),
    comparisonHighlight: 'Laser Cleaning',
  },
  safety: {
  },
  services: {
  },
  netalux: {
  },
};

export function generatePageSpecificSchema(
  pageType: StaticPageType,
  frontmatter: EnhancedStaticPageFrontmatter
): object | null {
  const pageEntry = getSharedStaticPageEntry(pageType);
  const pageUrl = `${SITE_CONFIG.url}${pageEntry.routePath}`;
  const breadcrumbItems = (frontmatter.breadcrumb || [
    { name: 'Home', href: '/' },
    { name: pageType.charAt(0).toUpperCase() + pageType.slice(1), href: pageEntry.routePath },
  ]).map((item: any, index: number) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name || item.label,
    item: `${SITE_CONFIG.url}${item.href || pageEntry.routePath}`,
  }));

  switch (pageType) {
    case 'about':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'AboutPage',
            name: frontmatter.pageTitle,
            description: frontmatter.pageDescription,
            url: pageUrl,
            mainEntity: {
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
            },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems,
          },
        ],
      };
    case 'contact':
      return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: frontmatter.pageTitle,
        description: frontmatter.pageDescription,
        url: pageUrl,
      };
    case 'services':
      return {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Service',
            name: frontmatter.pageTitle,
            description: frontmatter.pageDescription,
            provider: {
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
            },
            areaServed: 'United States',
            url: pageUrl,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems,
          },
          {
            '@type': 'CollectionPage',
            name: frontmatter.pageTitle,
            description: frontmatter.pageDescription,
            url: pageUrl,
          },
        ],
      };
    case 'netalux':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Netalux Laser Cleaning Equipment',
        description: frontmatter.pageDescription,
        url: pageUrl,
        brand: {
          '@type': 'Brand',
          name: 'Netalux',
        },
      };
    case 'comparison':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: frontmatter.pageTitle,
        description: frontmatter.pageDescription,
        url: pageUrl,
        about: {
          '@type': 'Thing',
          name: 'Surface Cleaning Methods Comparison',
        },
        mainEntity: {
          '@type': 'Table',
          about: 'Comparison of laser cleaning vs traditional surface cleaning methods',
        },
      };
    default:
      return null;
  }
}

export function buildPageHeaderAction(
  frontmatter: EnhancedStaticPageFrontmatter
): ReactNode | undefined {
  if (!frontmatter.headerCTA) {
    return undefined;
  }

  const baseClasses = {
    primary: 'inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors',
    secondary: 'inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors',
    brand: 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-brand-orange hover:bg-brand-orange-dark focus-visible:ring-brand-orange focus-visible:ring-offset-gray-900 shadow-lg hover:shadow-xl transform hover:scale-[1.03] px-2.5 py-1 text-base min-h-[40px]',
  } as const;

  const variant = frontmatter.headerCTA.variant || 'primary';
  const classes = baseClasses[variant];

  return (
    <Link
      href={frontmatter.headerCTA.href}
      className={classes}
      style={variant === 'brand' ? { color: '#2d3441' } : undefined}
    >
      {frontmatter.headerCTA.text}
      {variant === 'brand' && (
        <span className="inline-flex items-center w-5 h-5 ml-1.5">
          <svg
            aria-hidden="true"
            role="presentation"
            focusable="false"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      )}
    </Link>
  );
}
