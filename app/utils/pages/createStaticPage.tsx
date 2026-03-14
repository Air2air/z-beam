/**
 * Shared static-page factory.
 *
 * Static pages are frontmatter-driven and render through one of two live
 * architectures: content-card pages or dynamic-content pages.
 */

import { Layout } from '@/app/components/Layout/Layout';
import { ContentSection } from '@/app/components/ContentCard';
import { BaseSection } from '@/app/components/BaseSection';
import { ComparisonTable } from '@/app/components/ComparisonTable';
import { ClickableCard } from '@/app/components/ClickableCard';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { ScheduleContent } from '@/app/components/Schedule/ScheduleContent';
import Link from 'next/link';
import { SITE_CONFIG } from '@/app/config/site';
import { getEquipmentRentalPriceTable } from '@/app/utils/pricing/getEquipmentRentalPriceTable';
import { loadStaticPageFrontmatter, type StaticPageFrontmatter } from '@/app/utils/staticPageLoader';
import { generateStaticPageMetadata } from '@/lib/metadata/generators';
import type { ContentCardItem } from '@/types';
import type { ClickableCardProps } from '@/app/components/ClickableCard';
import {
  buildPageHeaderAction,
  buildDynamicSidebar,
  type EnhancedStaticPageFrontmatter,
  generatePageSpecificSchema,
  PAGE_CONFIGS,
  type StaticPageConfig,
  type StaticPageType,
} from '@/app/utils/pages/staticPagePolicy';
import { getSharedStaticPageEntry, isSharedStaticPageKey } from '@/app/utils/pages/staticPageRegistry';

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

interface PricingTableSection {
  id?: string;
  type: 'pricing-table';
  pricingSource?: 'equipment-rental';
  _section?: {
    title?: string;
    description?: string;
  };
}

/**
 * Shared static-page factory.
 */
export function createStaticPage(pageType: StaticPageType | string) {
  if (!isSharedStaticPageKey(pageType)) {
    const fallbackPath = pageType === 'home' ? '/' : `/${pageType}`;

    return {
      generateMetadata: async () => generateStaticPageMetadata({
        title: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        path: fallbackPath,
      }),
      default: async () => (
        <Layout title={SITE_CONFIG.name} description={SITE_CONFIG.description}>
          <p>Content unavailable.</p>
        </Layout>
      ),
    };
  }

  const config = PAGE_CONFIGS[pageType];
  const pageEntry = getSharedStaticPageEntry(pageType);
  
  /**
   * Generate metadata
   */
  const generateMetadata = async () => {
    const frontmatter = await loadStaticPageFrontmatter(pageType);
    
    return generateStaticPageMetadata({
      title: frontmatter.pageTitle,
      description: frontmatter.pageDescription,
      path: pageEntry.routePath,
      image:
        frontmatter.images?.og?.url ||
        frontmatter.openGraph?.image?.url ||
        frontmatter.images?.twitter?.url ||
        frontmatter.twitter?.image?.url ||
        frontmatter.images?.social?.url ||
        frontmatter.images?.hero?.url,
      keywords: frontmatter.keywords || [],
      noIndex: frontmatter.seo?.robots?.index === false
    });
  };
  
  /**
   * Render page component.
   */
  const Page = async () => {
    const frontmatter = await loadStaticPageFrontmatter(pageType) as EnhancedStaticPageFrontmatter;
    const pageSchema = generatePageSpecificSchema(pageType, frontmatter);
    
    // Determine page architecture from frontmatter override or registry default.
    const architecture = frontmatter.pageType || pageEntry.pageType || 'content-cards';
    
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

function hasDynamicFeature(
  frontmatter: EnhancedStaticPageFrontmatter,
  type: string,
  placement?: 'right-sidebar' | 'left-sidebar' | 'inline' | 'main-content'
): boolean {
  if (!Array.isArray(frontmatter.dynamicFeatures)) {
    return false;
  }

  return frontmatter.dynamicFeatures.some(feature => {
    if (feature.type !== type) {
      return false;
    }

    if (!placement) {
      return true;
    }

    return feature.placement === placement;
  });
}

function renderPricingTableSection(section: PricingTableSection, index: number) {
  if (section.pricingSource !== 'equipment-rental') {
    return null;
  }

  const pricingTable = getEquipmentRentalPriceTable();

  return (
    <BaseSection
      key={section.id || index}
      variant="default"
    >
        <div className="overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  {pricingTable.table.columns.map((column) => (
                    <th
                      key={column}
                      className={`px-4 py-2 text-base font-medium text-gray-300 border-b border-gray-700 uppercase ${
                        column === 'Rental Period' ? 'text-left' : 'text-center'
                      }`}
                      scope="col"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingTable.table.rows.map((row, index) => (
                  <tr
                    key={row.rentalPeriod}
                    className={`hover:bg-gray-800/40 border-b-2 border-gray-700 ${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50'}`}
                  >
                    <td className="px-4 py-3 text-base text-white">
                      <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                        <div className="font-medium text-white">{row.rentalPeriod}</div>
                        <div className="mt-1 text-sm text-gray-300 md:mt-0">{row.description}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-base text-center text-white">
                      {row.callToActionHref && row.savings === 'Call' ? (
                        <Link href={row.callToActionHref} className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
                          {row.savings}
                        </Link>
                      ) : (
                        row.savings
                      )}
                    </td>
                    <td className="px-4 py-3 text-base font-medium text-center text-white">
                      {row.callToActionHref && row.residentialRate === 'Call' ? (
                        <Link href={row.callToActionHref} className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
                          {row.residentialRate}
                        </Link>
                      ) : (
                        row.residentialRate
                      )}
                    </td>
                    <td className="px-4 py-3 text-base font-medium text-center text-white">
                      {row.callToActionHref && row.commercialRate === 'Call' ? (
                        <Link href={row.callToActionHref} className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
                          {row.commercialRate}
                        </Link>
                      ) : (
                        row.commercialRate
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </BaseSection>
  );
}

/**
 * Render dynamic-content pages.
 */
function renderDynamicContentPage(
  pageType: StaticPageType,
  frontmatter: EnhancedStaticPageFrontmatter,
  pageSchema: object | null,
  config: StaticPageConfig
) {
  const rightContent = buildPageHeaderAction(frontmatter) || buildDynamicSidebar(pageType, frontmatter);
  const jsonLdData = frontmatter.jsonLd || pageSchema;
  const hasInlineScheduleWidget = hasDynamicFeature(frontmatter, 'schedule-widget', 'main-content');
  const hasClickableCards = Array.isArray(frontmatter.clickableCards) && frontmatter.clickableCards.length > 0;
  const clickableCards = frontmatter.clickableCards || [];
  
  return (
    <Layout
      title={frontmatter.pageTitle}
      metadata={frontmatter}
      slug={pageType}
      rightContent={rightContent}
      hideAuthor
    >
      {jsonLdData && <JsonLD data={jsonLdData as Record<string, unknown>} />}
      
      {/* Inline schedule widget driven by frontmatter features. */}
      {hasInlineScheduleWidget && (
        <BaseSection
          title="Schedule Your Laser Cleaning"
          description="Choose a date and time that works for you"
          variant="default"
        >
          <ScheduleContent />
        </BaseSection>
      )}
      
      {/* Dynamic card grids from frontmatter. */}
      {hasClickableCards && (
        <BaseSection
          title="Our Services"
          description="Comprehensive laser cleaning solutions"
          variant="default"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clickableCards.map((card, index) => (
              <ClickableCard key={index} {...card} />
            ))}
          </div>
        </BaseSection>
      )}
      
      {/* Shared content sections for all dynamic pages. */}
      {frontmatter.sections && frontmatter.sections.map((section, index) => {
        if (section.type === 'content-section') {
          return (
            <ContentSection
              key={section.id || index}
              title={section._section?.title}
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
 * Render content-card pages.
 */
async function renderContentCardsPage(
  pageType: StaticPageType,
  frontmatter: StaticPageFrontmatter,
  pageSchema: object | null,
  config: StaticPageConfig
) {
  const enhancedFrontmatter = frontmatter as EnhancedStaticPageFrontmatter;
  let comparisonMethods: ComparisonMethod[] | undefined;
  const jsonLdData = enhancedFrontmatter.jsonLd || pageSchema;
  
  if (config?.hasComparison && config.comparisonData) {
    const data = await config.comparisonData();
    // Handle both array format and { methods: [] } format, and module.default format
    const rawData = data.default || data;
    comparisonMethods = Array.isArray(rawData) ? rawData : rawData.methods;
  }
  
  return (
    <Layout
      title={frontmatter.pageTitle}
      metadata={frontmatter}
      slug={pageType}
      rightContent={buildPageHeaderAction(enhancedFrontmatter)}
      hideAuthor
    >
      {jsonLdData && <JsonLD data={jsonLdData as Record<string, unknown>} />}
      
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
            
          case 'content-section':
            if (!section.items || !Array.isArray(section.items)) {
              return null;
            }
            return (
              <ContentSection
                key={section.id || index}
                items={section.items as ContentCardItem[]}
              />
            );

          case 'pricing-table':
            return renderPricingTableSection(section as PricingTableSection, index);
            
          default:
            return null;
        }
      })}

      {config?.renderSupplementalContent?.(enhancedFrontmatter)}
    </Layout>
  );
}
