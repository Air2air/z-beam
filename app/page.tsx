// app/page.tsx - Static optimized home page

import { Layout } from "./components/Layout/Layout";
import { HomePageGrid } from "./components/HomePageGrid";
import { ScheduleCards } from "./components/Schedule/ScheduleCards";
import { JsonLD } from "./components/JsonLD/JsonLD";
import { createMetadata } from "./utils/metadata";
import { SITE_CONFIG } from "@/app/config/site";
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

// Force static generation for home page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

// Generate metadata from home.yaml
export async function generateMetadata() {
  try {
    const yamlPath = path.join(process.cwd(), 'static-pages', 'home.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    const homeConfig = yaml.load(yamlContent) as any;

    return createMetadata({
      title: homeConfig?.title || SITE_CONFIG.name,
      description: homeConfig?.metaDescription || homeConfig?.meta_description || homeConfig?.description || SITE_CONFIG.description,
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
  // Read the YAML configuration for the home page
  try {
    const yamlPath = path.join(process.cwd(), 'static-pages', 'home.yaml');
    const yamlContent = await fs.readFile(yamlPath, 'utf8');
    const homeConfig = yaml.load(yamlContent) as any;

    // Create frontmatter object for Hero component (loaded from Layout)
    const heroFrontmatter = {
    title: homeConfig.title,
    description: homeConfig.description,
    slug: homeConfig.slug,
    video: homeConfig.video, // YouTube ID from YAML - Hero will render if video exists
    images: homeConfig.images, // Include hero images from YAML
  };

    // Extract featured sections from YAML
    const featuredSections = homeConfig.featuredSections || [];
    
    // Page title and subtitle for consistent Title component display
    const pageTitle = homeConfig.title;
    const pageDescription = homeConfig.description;

    // Generate JSON-LD schemas for homepage
    const breadcrumbs = homeConfig.breadcrumb;
    
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
          description: SITE_CONFIG.pricing.equipmentRental.description,
          brand: {
            '@type': 'Brand',
            name: SITE_CONFIG.name
          },
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: SITE_CONFIG.pricing.equipmentRental.packages.outdoor.hourlyRate,
            highPrice: SITE_CONFIG.pricing.equipmentRental.packages.indoor.hourlyRate,
            priceCurrency: SITE_CONFIG.pricing.equipmentRental.currency,
            priceValidUntil: '2026-12-31',
            availability: 'https://schema.org/InStock',
            url: `${SITE_CONFIG.url}/rental`,
            offerCount: 3,
            seller: {
              '@type': 'Organization',
              '@id': `${SITE_CONFIG.url}/#organization`
            },
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: SITE_CONFIG.pricing.equipmentRental.packages.outdoor.hourlyRate,
              maxPrice: SITE_CONFIG.pricing.equipmentRental.packages.indoor.hourlyRate,
              priceCurrency: SITE_CONFIG.pricing.equipmentRental.currency,
              unitText: SITE_CONFIG.pricing.equipmentRental.unit,
              referenceQuantity: {
                '@type': 'QuantitativeValue',
                value: SITE_CONFIG.pricing.equipmentRental.minimumHours,
                unitCode: 'HUR'
              }
            }
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
          name: pageTitle,
          description: homeConfig.description || SITE_CONFIG.description,
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
          metadata={heroFrontmatter}
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
