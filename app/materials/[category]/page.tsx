// app/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '@/app/metadata';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import CategoryDatasetCardWrapper from '@/app/components/Dataset/CategoryDatasetCardWrapper';

// Static generation for all category pages
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      title: `Category Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested material category was not found.',
    };
  }

  const categoryMetadata = CATEGORY_METADATA[category];
  
  return createMetadata({
    title: categoryMetadata.title,
    description: categoryMetadata.description,
    keywords: categoryMetadata.keywords,
    image: categoryMetadata.ogImage,
    slug: `materials/${category}`,
    canonical: `${SITE_CONFIG.url}/materials/${category}`,
  });
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  
  // Validate category exists
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // Get metadata for this category
  const categoryMetadata = CATEGORY_METADATA[category];
  
  // Get category structure with subcategories
  const allCategories = await getAllCategories();
  const categoryData = allCategories.find(cat => cat.slug === category);
  
  if (!categoryData) {
    notFound();
  }
  
  // Capitalize category name for display
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = `${categoryDisplayName} Laser Cleaning`;
  const pageSubtitle = categoryMetadata.subtitle;

  // Create metadata object with breadcrumb configuration
  const metadata = {
    title: pageTitle,
    subtitle: pageSubtitle,
    description: categoryMetadata.description,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: categoryDisplayName, href: `/materials/${category}` }
    ]
  };

  // Generate comprehensive JSON-LD schemas using @graph pattern
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/materials/${category}#webpage`,
        'name': pageTitle,
        'description': categoryMetadata.description,
        'url': `${SITE_CONFIG.url}/materials/${category}`,
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
          '@id': `${SITE_CONFIG.url}/materials/${category}#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/materials/${category}#itemlist`
        }
      },
      
      // 2. BreadcrumbList schema (separate for better discovery)
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_CONFIG.url}/materials/${category}#breadcrumb`,
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
            'name': categoryDisplayName,
            'item': `${SITE_CONFIG.url}/materials/${category}`
          }
        ]
      },
      
      // 3. ItemList schema for materials
      {
        '@type': 'ItemList',
        '@id': `${SITE_CONFIG.url}/materials/${category}#itemlist`,
        'numberOfItems': categoryData.materials.length,
        'itemListElement': categoryData.subcategories.flatMap((subcategory, subIndex) => 
          subcategory.materials.map((material, matIndex) => ({
            '@type': 'ListItem',
            'position': subIndex * 100 + matIndex + 1,
            'name': material.name,
            'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`,
            'item': {
              '@type': 'Article',
              '@id': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`,
              'name': material.name,
              'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory.slug}/${material.slug}`
            }
          }))
        )
      },
      
      // 4. Dataset schema for category-level data aggregation
      {
        '@type': 'Dataset',
        '@id': `${SITE_CONFIG.url}/materials/${category}#dataset`,
        'name': `${categoryDisplayName} Laser Cleaning Parameters Dataset`,
        'description': `Comprehensive dataset of ${categoryData.materials.length} ${category} materials with laser cleaning parameters, machine settings, and material properties for industrial applications.`,
        'alternateName': `${categoryDisplayName} Materials Database`,
        'url': `${SITE_CONFIG.url}/materials/${category}`,
        'identifier': `${SITE_CONFIG.url}/materials/${category}#dataset`,
        'author': {
          '@id': `${SITE_CONFIG.url}#author-technical-team`
        },
        'creator': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url,
          'sameAs': SITE_CONFIG.social.linkedin
        },
        'publisher': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'license': {
          '@type': 'CreativeWork',
          'name': 'Creative Commons Attribution 4.0 International',
          'url': 'https://creativecommons.org/licenses/by/4.0/',
          'identifier': 'CC BY 4.0'
        },
        'keywords': [category, 'laser cleaning', 'material properties', 'machine settings', 'industrial parameters'],
        'temporalCoverage': '2024/..',
        'spatialCoverage': 'Global',
        'variableMeasured': [
          'wavelength',
          'power',
          'fluence',
          'pulse duration',
          'repetition rate',
          'scan speed',
          'thermal conductivity',
          'hardness',
          'ablation threshold'
        ],
        'distribution': [
          {
            '@type': 'DataDownload',
            'encodingFormat': 'application/json',
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}.json`,
            'description': `JSON format dataset with ${categoryData.materials.length} ${category} materials`
          },
          {
            '@type': 'DataDownload',
            'encodingFormat': 'text/csv',
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}.csv`,
            'description': `CSV format dataset with ${categoryData.materials.length} ${category} materials`
          },
          {
            '@type': 'DataDownload',
            'encodingFormat': 'text/plain',
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}.txt`,
            'description': `Plain text format dataset with ${categoryData.materials.length} ${category} materials`
          }
        ],
        'hasPart': categoryData.materials.map((material) => ({
          '@type': 'Dataset',
          'name': material.name,
          'url': `${SITE_CONFIG.url}/materials/${category}/${material.subcategory || 'uncategorized'}/${material.slug}`
        }))
      },
      
      // 5. WebPage schema
      {
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/materials/${category}`,
        'name': pageTitle,
        'description': categoryMetadata.description,
        'url': `${SITE_CONFIG.url}/materials/${category}`,
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
          '@id': `${SITE_CONFIG.url}/materials/${category}#breadcrumb`
        },
        'mainEntity': {
          '@id': `${SITE_CONFIG.url}/materials/${category}#dataset`
        }
      },
      
      // 6. Person schema - Technical author with E-E-A-T enhancements
      {
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}#author-technical-team`,
        'name': 'Z-Beam Technical Team',
        'jobTitle': 'Laser Cleaning Specialists',
        'email': SITE_CONFIG.contact.general.email,
        'url': `${SITE_CONFIG.url}/about`,
        'knowsAbout': [
          `${categoryDisplayName} laser cleaning`,
          'Material science and surface treatment',
          'Industrial laser systems',
          'Laser ablation parameters',
          'Material properties and characteristics'
        ],
        'worksFor': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name
        },
        'hasCredential': [
          {
            '@type': 'EducationalOccupationalCredential',
            'name': 'Laser Safety Certification',
            'credentialCategory': 'Professional Certification'
          },
          {
            '@type': 'EducationalOccupationalCredential',
            'name': 'Materials Science Expertise',
            'credentialCategory': 'Professional Expertise'
          }
        ],
        'description': `Expert team specializing in laser cleaning research, material analysis, and industrial surface treatment applications for ${category} materials.`
      }
    ]
  };

  // Collect all materials in this category for dataset
  const allMaterials = categoryData.subcategories.flatMap(sub => 
    sub.materials.map(mat => ({
      ...mat,
      subcategory: sub.slug,
      subcategoryLabel: sub.label
    }))
  );

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        subtitle={pageSubtitle} 
        metadata={metadata as any}
        slug={`materials/${category}`}
        fullWidth
      >
        <div className={CONTAINER_STYLES.standard}>
          {/* Group materials by subcategory */}
          {categoryData.subcategories.map((subcategory) => (
            <section key={subcategory.slug} className="mb-12" aria-labelledby={`subcategory-${subcategory.slug}`}>
              <h2 
                id={`subcategory-${subcategory.slug}`}
                className="subcategory-title text-xl font-semibold text-gray-900 dark:text-white mb-4"
              >
                {subcategory.label}
              </h2>
              
              <CardGridSSR
                slugs={subcategory.materials.map(m => m.slug)}
                columns={3}
                mode="simple"
                showBadgeSymbols={true}
                loadBadgeSymbolData={true}
              />
            </section>
          ))}
        </div>
        
        {/* Category Dataset Section at bottom */}
        <div className={`${CONTAINER_STYLES.main} mt-16 mb-16`}>
          <CategoryDatasetCardWrapper 
            category={category}
            categoryLabel={categoryDisplayName}
            materials={allMaterials}
            subcategoryCount={categoryData.subcategories.length}
          />
        </div>
      </Layout>
    </>
  );
}