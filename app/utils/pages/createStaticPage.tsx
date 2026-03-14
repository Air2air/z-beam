/**
 * Enhanced Static Page Factory (v2.0)
 * 
 * Now supports THREE page architectures:
 * 1. Content-Cards Pages (rental, about, contact, etc.) - YAML-based content sections
 * 2. Dynamic-Content Pages (schedule, services, netalux) - Custom widgets + YAML content
 * 3. Collection Pages - Handled by separate CollectionPage component
 * 
 * NEW: Dynamic Features Support
 * - schedule-widget: Real-time scheduling component
 * - clickable-cards: YAML-defined card grids
 * - header-cta: Custom call-to-action buttons
 * - custom-sections: Page-specific components
 * 
 * Usage:
 *   export const { generateMetadata, default: Page } = createStaticPage('schedule');
 *   
 * YAML Config Example:
 *   pageType: 'dynamic-content'  # NEW: Determines rendering strategy
 *   dynamicFeatures:              # NEW: Enables custom components
 *     - type: 'schedule-widget'
 *       placement: 'right-sidebar'
 *     - type: 'header-cta'
 *       text: 'Schedule Now'
 *       href: '#schedule'
 */

import { Layout } from '@/app/components/Layout/Layout';
import { ContentSection } from '@/app/components/ContentCard';
import { BaseSection } from '@/app/components/BaseSection';
import { ComparisonTable } from '@/app/components/ComparisonTable';
import { ContactInfo } from '@/app/components/Contact/ContactInfo';
import { ClickableCard } from '@/app/components/ClickableCard';
import { ScheduleContent } from '@/app/components/Schedule/ScheduleContent';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { loadStaticPageFrontmatter, type StaticPageFrontmatter } from '@/app/utils/staticPageLoader';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import { generatePageSchema } from '@/lib/schema/generators';
import { SITE_CONFIG } from '@/app/config/site';
import type { ContentCardItem, ArticleMetadata } from '@/types';
import type { ClickableCardProps } from '@/app/components/ClickableCard';

// Local ComparisonMethod interface (not exported from @/types)
interface ComparisonMethod {
  method: string;
  description: string;
  key_differences: string;
  all_up_cost_for_100_sq_ft_usd: string;
  all_up_cost_explanation: string;
  surface_damage: string;
  base_hourly_rate_usd: string;
  extra_setup_cleanup_factors: string;
  adjusted_hourly_rate_usd: string;
  notes: string;
  cleaning_rate_sq_ft_per_hr: string;
  cleaning_rate_explanation: string;
  cost_per_sq_ft_usd: string;
  cost_per_sq_ft_explanation: string;
  avg_rate_explanation: string;
  initial_setup_cost_usd: string;
  consumables_cost_per_hour_usd: string;
  [key: string]: string;
}

type StaticPageType = 
  | 'rental' 
  | 'about' 
  | 'contact' 
  | 'thank-you'
  | 'partners' 
  | 'equipment' 
  | 'operations' 
  | 'safety'
  | 'schedule'  // NEW: Dynamic pages
  | 'services'
  | 'netalux'
  | 'comparison';

/**
 * NEW: Page type classification for rendering strategy
 */
type PageArchitecture = 'content-cards' | 'dynamic-content';

/**
 * NEW: Dynamic feature configuration
 */
interface DynamicFeature {
  type: 'schedule-widget' | 'clickable-cards' | 'header-cta' | 'custom-section';
  placement?: 'right-sidebar' | 'left-sidebar' | 'inline';
  config?: Record<string, any>;
}

/**
 * NEW: Extended frontmatter with dynamic features
 */
interface EnhancedStaticPageFrontmatter extends StaticPageFrontmatter {
  pageType?: PageArchitecture;  // Determines rendering strategy
  dynamicFeatures?: DynamicFeature[];  // Custom components/widgets
  clickableCards?: ClickableCardProps[];  // YAML-defined cards (for services)
  headerCTA?: {  // Custom header CTA (for schedule)
    text: string;
    href: string;
    variant?: 'primary' | 'secondary';
  };
  sections?: any[];  // Dynamic sections
}

/**
 * Page-specific configurations for special features
 * ENHANCED: Now includes dynamic page configs
 */
const PAGE_CONFIGS = {
  // Existing content-cards pages
  rental: {
    pageType: 'content-cards' as PageArchitecture,
    hasComparison: true,
    comparisonData: () => import('@/data/comparison-methods.json'),
    comparisonHighlight: 'Laser Cleaning'
  },
  contact: {
    pageType: 'content-cards' as PageArchitecture,
    hasContactInfo: true,
    robotsIndex: true
  },
  'thank-you': {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  about: {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  partners: {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  equipment: {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  operations: {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  comparison: {
    pageType: 'content-cards' as PageArchitecture,
    hasComparison: true,
    comparisonData: () => import('@/data/comparison-methods.json'),
    comparisonHighlight: 'Laser Cleaning',
    robotsIndex: true
  },
  safety: {
    pageType: 'content-cards' as PageArchitecture,
    robotsIndex: true
  },
  
  // NEW: Dynamic content pages
  schedule: {
    pageType: 'dynamic-content' as PageArchitecture,
    hasScheduleWidget: true,
    hasHeaderCTA: true,
    robotsIndex: true
  },
  services: {
    pageType: 'dynamic-content' as PageArchitecture,
    hasClickableCards: true,
    robotsIndex: true
  },
  netalux: {
    pageType: 'dynamic-content' as PageArchitecture,
    hasCustomCards: true,
    robotsIndex: true
  }
};

/**
 * Generate page-specific JSON-LD schema
 * ENHANCED: Now supports dynamic page schemas
 */
function generatePageSpecificSchema(
  pageType: StaticPageType, 
  frontmatter: EnhancedStaticPageFrontmatter
): object | null {
  const breadcrumbItems = (frontmatter.breadcrumb || [
    { name: 'Home', href: '/' },
    { name: pageType.charAt(0).toUpperCase() + pageType.slice(1), href: `/${pageType}` }
  ]).map((item: any, index: number) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name || item.label,
    item: `${SITE_CONFIG.url}${item.href || `/${pageType}`}`
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
            url: `${SITE_CONFIG.url}/about`,
            mainEntity: {
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url
            }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems
          }
        ]
      };
      
    case 'contact':
      return {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: frontmatter.pageTitle,
        description: frontmatter.pageDescription,
        url: `${SITE_CONFIG.url}/contact`
      };
      
    case 'rental':
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
              url: SITE_CONFIG.url
            },
            areaServed: 'United States'
          },
          {
            '@type': 'Product',
            name: `${frontmatter.pageTitle} Package`,
            description: frontmatter.pageDescription,
            brand: {
              '@type': 'Brand',
              name: SITE_CONFIG.name
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              url: `${SITE_CONFIG.url}/${pageType}`
            }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems
          },
          {
            '@type': 'VideoObject',
            name: `${frontmatter.pageTitle} Overview`,
            description: frontmatter.pageDescription,
            thumbnailUrl: frontmatter.images?.hero?.url
              ? `${SITE_CONFIG.url}${frontmatter.images.hero.url}`
              : `${SITE_CONFIG.url}/images/og-default.png`,
            contentUrl: `${SITE_CONFIG.url}/${pageType}`,
            embedUrl: `${SITE_CONFIG.url}/${pageType}`
          }
        ]
      };

    case 'schedule':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: frontmatter.pageTitle,
        description: frontmatter.pageDescription,
        url: `${SITE_CONFIG.url}/schedule`,
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_CONFIG.url}/schedule`,
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform'
            ]
          }
        }
      };
      
    case 'netalux':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Netalux Laser Cleaning Equipment',
        description: frontmatter.pageDescription,
        url: `${SITE_CONFIG.url}/netalux`,
        brand: {
          '@type': 'Brand',
          name: 'Netalux'
        }
      };
      
    case 'comparison':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: frontmatter.pageTitle,
        description: frontmatter.pageDescription,
        url: `${SITE_CONFIG.url}/comparison`,
        about: {
          '@type': 'Thing',
          name: 'Surface Cleaning Methods Comparison'
        },
        mainEntity: {
          '@type': 'Table',
          about: 'Comparison of laser cleaning vs traditional surface cleaning methods'
        }
      };
      
    default:
      return null;
  }
}

/**
 * Enhanced Static Page Factory
 * NOW SUPPORTS: Content-cards AND Dynamic-content pages
 */
export function createStaticPage(pageType: StaticPageType) {
  const config = PAGE_CONFIGS[pageType];
  
  /**
   * Generate metadata
   */
  const generateMetadata = async () => {
    const frontmatter = await loadStaticPageFrontmatter(pageType);
    
    return generateStaticPageMetadata({
      title: frontmatter.pageTitle,
      description: frontmatter.pageDescription,
      path: `/${pageType}`,
      keywords: frontmatter.keywords || []
    });
  };
  
  /**
   * Render page component
   * ENHANCED: Routes to appropriate renderer based on pageType
   */
  const Page = async () => {
    const frontmatter = await loadStaticPageFrontmatter(pageType) as EnhancedStaticPageFrontmatter;
    const pageSchema = generatePageSpecificSchema(pageType, frontmatter);
    
    // Determine page architecture (from YAML or config)
    const architecture = frontmatter.pageType || config?.pageType || 'content-cards';
    
    // Route to appropriate renderer  
    if (architecture === 'dynamic-content') {
      return await renderDynamicContentPage(pageType, frontmatter, pageSchema, config);
    } else {
      return await renderContentCardsPage(pageType, frontmatter, pageSchema, config);
    }
  };
  
  return {
    generateMetadata,
    default: Page
  };
}

/**
 * NEW: Render dynamic-content pages (schedule, services, netalux)
 */
function renderDynamicContentPage(
  pageType: StaticPageType,
  frontmatter: EnhancedStaticPageFrontmatter,
  pageSchema: object | null,
  config: any
) {
  // Build right sidebar content (schedule widget, CTA buttons, etc.)
  const rightContent = buildDynamicSidebar(pageType, frontmatter, config);
  const shouldRenderJsonLd = pageType !== 'netalux';
  
  return (
    <Layout
      title={frontmatter.pageTitle}
      slug={pageType}
      rightContent={rightContent}
    >
      {shouldRenderJsonLd && pageSchema && <JsonLD data={pageSchema as Record<string, unknown>} />}
      
      {/* Schedule-specific: Widget in main content area */}
      {pageType === 'schedule' && config?.hasScheduleWidget && (
        <BaseSection
          title="Schedule Your Laser Cleaning"
          description="Choose a date and time that works for you"
          variant="default"
        >
          <ScheduleContent />
        </BaseSection>
      )}
      
      {/* Dynamic card grids from YAML */}
      {config?.hasClickableCards && frontmatter.clickableCards && (
        <BaseSection
          title="Our Services"
          description="Comprehensive laser cleaning solutions"
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frontmatter.clickableCards.map((card, index) => (
              <ClickableCard key={index} {...card} />
            ))}
          </div>
        </BaseSection>
      )}
      
      {/* Netalux-specific: Custom card filtering logic */}
      {pageType === 'netalux' && frontmatter.sections && (
        <>
          {frontmatter.sections.map((section, index) => {
            if (section.type !== 'content-section') {
              return null;
            }

            const sectionItems = Array.isArray(section.items)
              ? (section.items as ContentCardItem[])
              : [];

            return (
              <BaseSection
                key={section.id || index}
                title={section._section?.title || ''}
                description={section._section?.description || ''}
                variant="minimal"
              >
                <div className="space-y-6">
                  {sectionItems.map((item, itemIndex) => (
                    <article key={`${section.id || index}-${itemIndex}`} className="space-y-2">
                      {item.heading && (
                        <h3 className="text-xl font-semibold">{item.heading}</h3>
                      )}
                      {item.text && (
                        <p
                          className="text-base"
                          dangerouslySetInnerHTML={{ __html: item.text }}
                        />
                      )}
                    </article>
                  ))}
                </div>
              </BaseSection>
            );
          })}
        </>
      )}
      
      {/* Standard content sections for all dynamic pages */}
      {frontmatter.sections && frontmatter.sections.map((section, index) => {
        if (section.type === 'content-section' && pageType !== 'netalux') {
          return (
            <ContentSection
              key={section.id || index}
              items={section.items as ContentCardItem[]}
            />
          );
        }
        return null;
      })}
    </Layout>
  );
}

/**
 * Build dynamic sidebar content (schedule widget, CTAs, etc.)
 * NEW: Supports custom sidebar components
 */
function buildDynamicSidebar(
  pageType: StaticPageType,
  frontmatter: EnhancedStaticPageFrontmatter,
  config: any
): React.ReactNode | undefined {
  // Schedule page: CTA button
  if (pageType === 'schedule' && config?.hasHeaderCTA && frontmatter.headerCTA) {
    return (
      <a
        href={frontmatter.headerCTA.href}
        className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        {frontmatter.headerCTA.text}
      </a>
    );
  }
  
  // Future: Other sidebar widgets
  if (frontmatter.dynamicFeatures) {
    const sidebarFeature = frontmatter.dynamicFeatures.find(
      f => f.placement === 'right-sidebar'
    );
    
    if (sidebarFeature?.type === 'schedule-widget') {
      return <ScheduleContent />;
    }
  }
  
  return undefined;
}

/**
 * Render content-cards pages (existing static pages)
 * BACKWARD COMPATIBLE: No changes to existing functionality
 */
async function renderContentCardsPage(
  pageType: StaticPageType,
  frontmatter: StaticPageFrontmatter,
  pageSchema: object | null,
  config: any
) {
  let comparisonMethods: ComparisonMethod[] | undefined;
  
  if (config?.hasComparison && config.comparisonData) {
    const data = await config.comparisonData();
    // Handle both array format and { methods: [] } format, and module.default format
    const rawData = data.default || data;
    comparisonMethods = Array.isArray(rawData) ? rawData : rawData.methods;
  }
  
  return (
    <Layout
      title={frontmatter.pageTitle}
      slug={pageType}
    >
      {pageSchema && <JsonLD data={pageSchema as Record<string, unknown>} />}
      
      {/* Content sections from YAML */}
      {frontmatter.sections && frontmatter.sections.map((section, index) => {
        switch (section.type) {
          case 'comparison':
            return comparisonMethods ? (
              <BaseSection
                key={section.id || index}
                title={section._section?.title || 'Comparison'}
                description={section._section?.description}
                variant="default"
              >
                <ComparisonTable
                  methods={comparisonMethods}
                  highlightMethod={config.comparisonHighlight}
                />
              </BaseSection>
            ) : null;
            
          case 'clickable-cards':
            if (!section.cards) return null;
            return (
              <BaseSection
                key={section.id || index}
                title={section._section?.title}
                description={section._section?.description}
                variant="default"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.cards.map((card: ClickableCardProps, cardIndex: number) => (
                    <ClickableCard key={cardIndex} {...card} />
                  ))}
                </div>
              </BaseSection>
            );
            
          case 'contact-info':
            return (
              <BaseSection
                key={section.id || index}
                title={section._section?.title || 'Contact Information'}
                description={section._section?.description}
                variant="default"
              >
                <ContactInfo />
              </BaseSection>
            );
            
          case 'content-section':
            // Debug: Log section structure
            console.log('Section:', section);
            console.log('Items:', section.items);
            console.log('Is Array:', Array.isArray(section.items));
            
            if (!section.items || !Array.isArray(section.items)) {
              console.error('Items is not an array or is undefined:', section.items);
              return null;
            }
            return (
              <ContentSection
                key={section.id || index}
                items={section.items as ContentCardItem[]}
              />
            );
            
          default:
            return null;
        }
      })}
      
      {/* Contact info for contact page */}
      {config?.hasContactInfo && (
        <ContactInfo />
      )}
    </Layout>
  );
}
