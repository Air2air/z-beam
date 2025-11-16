// app/materials/page.tsx
// Main materials overview page - displays all material categories

import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { getCategoryDescription, getCategoryMaterialType } from '@/app/config/categoryDescriptions';

export const dynamic = 'force-static';
export const revalidate = false;

// SEO metadata
export async function generateMetadata() {
  return createMetadata({
    title: 'Material Categories',
    description: 'Browse our comprehensive collection of materials including metals, ceramics, composites, semiconductors, and more. Find laser cleaning parameters and machine settings for your specific material.',
    keywords: ['materials', 'laser cleaning', 'metals', 'ceramics', 'composites', 'semiconductors', 'glass', 'stone', 'wood', 'plastics'],
    slug: 'materials',
    canonical: `${SITE_CONFIG.url}/materials`,
  });
}

export default async function MaterialsPage() {
  // Get all categories
  const categories = await getAllCategories();
  
  const pageTitle = 'Material Categories';
  const pageSubtitle = 'Explore laser cleaning parameters and machine settings for every material type';

  // Create metadata object with breadcrumb configuration
  const metadata = {
    title: pageTitle,
    subtitle: pageSubtitle,
    description: 'Browse our comprehensive collection of materials including metals, ceramics, composites, semiconductors, and more.',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Materials', href: '/materials' }
    ]
  };

  // Generate JSON-LD schema
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/materials#webpage`,
        'name': pageTitle,
        'description': metadata.description,
        'url': `${SITE_CONFIG.url}/materials`,
        'author': {
          '@id': `${SITE_CONFIG.url}#author-technical-team`
        },
        'publisher': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'breadcrumb': {
          '@id': `${SITE_CONFIG.url}/materials#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/materials#itemlist`
        }
      },
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/materials#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': SITE_CONFIG.url
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Materials',
            'item': `${SITE_CONFIG.url}/materials`
          }
        ]
      },
      
      // 3. ItemList schema for categories
      {
        '@type': 'ItemList',
        '@id': `${SITE_CONFIG.url}/materials#itemlist`,
        'numberOfItems': categories.length,
        'itemListElement': categories.map((category, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': category.label,
          'url': `${SITE_CONFIG.url}/materials/${category.slug}`,
          'item': {
            '@type': 'CollectionPage',
            '@id': `${SITE_CONFIG.url}/materials/${category.slug}`,
            'name': `${category.label} Laser Cleaning`,
            'url': `${SITE_CONFIG.url}/materials/${category.slug}`,
            'numberOfItems': category.materials.length
          }
        }))
      },
      
      // 4. WebPage schema
      {
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/materials`,
        'name': pageTitle,
        'description': metadata.description,
        'url': `${SITE_CONFIG.url}/materials`,
        'author': {
          '@id': `${SITE_CONFIG.url}#author-technical-team`
        },
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}#website`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'breadcrumb': {
          '@id': `${SITE_CONFIG.url}/materials#breadcrumb`
        }
      },
      
      // 5. Person schema - Technical author
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}#author-technical-team`,
        'name': 'Z-Beam Technical Team',
        'jobTitle': 'Laser Cleaning Specialists',
        'email': SITE_CONFIG.contact.general.email,
        'url': `${SITE_CONFIG.url}/about`,
        'knowsAbout': [
          'Laser cleaning technology',
          'Material science and surface treatment',
          'Industrial laser systems',
          'Material properties and characteristics'
        ],
        'worksFor': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name
        }
      }
    ]
  };

  // Map categories to card format
  const categoryCards = categories.map(category => {
    // Get material type from config
    const materialType = getCategoryMaterialType(category.slug);
    
    // Get description from config
    const description = getCategoryDescription(category.slug, category.label);
    
    // Get image URL based on first material in category or default
    const firstMaterial = category.materials[0];
    const imageUrl = `/images/material/${firstMaterial?.slug || category.slug}-hero.jpg`;
    
    return {
      slug: `materials/${category.slug}`,
      title: category.label,
      description,
      href: `/materials/${category.slug}`,
      imageUrl,
      imageAlt: `${category.label} laser cleaning`,
      badge: {
        materialType,
        symbol: "",
        formula: "",
      },
    };
  });

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        subtitle={pageSubtitle} 
        metadata={metadata as any}
        slug="materials"
      >
        <div className="mb-8">
          {/* @ts-ignore - Async Server Component (React 19 type limitation) */}
          <CardGridSSR
            items={categoryCards}
            columns={3}
            variant="default"
          />
        </div>
      </Layout>
    </>
  );
}
