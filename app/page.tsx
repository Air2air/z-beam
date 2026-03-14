import { SERVICES_HUB_PATH } from '@/app/utils/pages/staticPagePolicy';

// app/page.tsx - Static optimized home page

import { Layout } from "./components/Layout/Layout";
import { HomePageGrid } from "./components/HomePageGrid";
import { ScheduleCards } from "./components/Schedule/ScheduleCards";
import { JsonLD } from "./components/JsonLD/JsonLD";
import { createMetadata } from "./utils/metadata";
import {
  SITE_CONFIG,
  createEquipmentRentalAggregateOffer,
  getEquipmentRentalDescription,
} from "@/app/config/site";
import {
  loadStaticPageFrontmatter,
  type HomePageFrontmatter,
} from '@/app/utils/staticPageLoader';

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

// Viewport configuration for mobile optimization
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

function loadHomeFrontmatter(): HomePageFrontmatter {
  return loadStaticPageFrontmatter<HomePageFrontmatter>('home');
}

// Generate metadata from shared homepage frontmatter
export async function generateMetadata() {
  try {
    const homeConfig = loadHomeFrontmatter();

    const resolvedTitle =
      homeConfig?.pageTitle ||
      homeConfig?.title ||
      SITE_CONFIG.name;

    const resolvedDescription =
      homeConfig?.pageDescription ||
      homeConfig?.metaDescription ||
      homeConfig?.description ||
      SITE_CONFIG.description;

    return createMetadata({
      title: resolvedTitle,
      description: resolvedDescription,
      keywords: homeConfig?.keywords || [...SITE_CONFIG.keywords],
      image: "/images/home-og.jpg",
      slug: "home",
      canonical: SITE_CONFIG.url,
    });
  } catch (error) {
    console.error('Error loading home metadata:', error);
    return createMetadata({
      title: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      slug: "home",
    });
  }
}

export default async function HomePage() {
  try {
    const homeConfig = loadHomeFrontmatter();

    const featuredSections = homeConfig.featuredSections || [];
    
    const pageTitle = homeConfig.title || homeConfig.pageTitle || SITE_CONFIG.name;
    const pageDescription = homeConfig.description || homeConfig.pageDescription || SITE_CONFIG.description;

    const breadcrumbs = homeConfig.breadcrumb || [];
    const rentalOffer = createEquipmentRentalAggregateOffer(
      `${SITE_CONFIG.url}${SERVICES_HUB_PATH}`,
      `${SITE_CONFIG.url}/#organization`
    );
    
    const jsonLdSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        // Organization
        {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}/#organization`,
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_CONFIG.url}/images/logo.png`,
            width: 250,
            height: 250
          },
          description: SITE_CONFIG.description,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            email: SITE_CONFIG.contact.general.email,
            telephone: SITE_CONFIG.contact.general.phone,
            availableLanguage: 'en'
          },
          sameAs: [
            SITE_CONFIG.social.facebook,
            SITE_CONFIG.social.twitter,
            SITE_CONFIG.social.linkedin,
            SITE_CONFIG.social.youtube
          ].filter(Boolean)
        },
        // Product - Equipment Rental Service
        {
          '@type': 'Product',
          '@id': `${SITE_CONFIG.url}/#product-equipment-rental`,
          name: 'Laser Cleaning Equipment Rental',
          description: getEquipmentRentalDescription(),
          brand: {
            '@type': 'Brand',
            name: SITE_CONFIG.name
          },
          offers: {
            ...rentalOffer,
            priceValidUntil: '2026-12-31',
          },
          category: 'Equipment Rental Service'
        },
        // BreadcrumbList
        {
          '@type': 'BreadcrumbList',
          '@id': `${SITE_CONFIG.url}/#breadcrumb`,
          itemListElement: breadcrumbs.map((crumb: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            item: index < breadcrumbs.length - 1 ? `${SITE_CONFIG.url}${crumb.href}` : undefined
          }))
        },
        // WebPage
        {
          '@type': 'WebPage',
          '@id': `${SITE_CONFIG.url}/#webpage`,
          url: SITE_CONFIG.url,
          name: homeConfig.pageTitle || pageTitle || SITE_CONFIG.name,
          description: homeConfig.pageDescription || homeConfig.description || SITE_CONFIG.description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${SITE_CONFIG.url}/#website`
          },
          breadcrumb: {
            '@id': `${SITE_CONFIG.url}/#breadcrumb`
          },
          inLanguage: 'en-US',
          potentialAction: {
            '@type': 'ReadAction',
            target: [SITE_CONFIG.url]
          }
        },
        // VideoObject - Homepage video
        ...(homeConfig.video?.id ? [{
          '@type': 'VideoObject',
          '@id': `${SITE_CONFIG.url}/#video`,
          name: homeConfig.video.title,
          description: homeConfig.video.description,
          thumbnailUrl: `https://img.youtube.com/vi/${homeConfig.video.id}/maxresdefault.jpg`,
          uploadDate: homeConfig.datePublished,
          contentUrl: `https://www.youtube.com/watch?v=${homeConfig.video.id}`,
          embedUrl: `https://www.youtube.com/embed/${homeConfig.video.id}`,
          duration: homeConfig.video.duration,
          inLanguage: 'en-US'
        }] : [])
      ]
    };

    return (
      <>
        <JsonLD data={jsonLdSchema} />
        <Layout 
          title={pageTitle}
          metadata={homeConfig}
          customHeroOverlay={true}
        >
          {/* Schedule Cards Section */}
          <div className="mb-12">
            <ScheduleCards />
          </div>

          {/* Featured Solutions Section */}
          {featuredSections.length > 0 && (
            <HomePageGrid items={featuredSections} />
          )}
        </Layout>
      </>
    );
  } catch (error) {
    console.error('Error loading home page content:', error);
    // Return minimal fallback page
    return (
      <Layout title={SITE_CONFIG.name} description="Advanced laser surface treatment solutions">
        <p>Welcome to Z-Beam. Content is loading...</p>
      </Layout>
    );
  }
}
