// app/[category]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import { getAllCategories, getSubcategoryInfo } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { CardGridSSR } from "@/app/components/CardGrid";
import { createMetadata } from "@/app/utils/metadata";
import { CONTAINER_STYLES } from "@/app/utils/containerStyles";

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

// Generate static params for all subcategories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params: { category: string; subcategory: string }[] = [];
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      params.push({
        category: category.slug,
        subcategory: subcategory.slug
      });
    }
  }
  
  return params;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfo(category, subcategory);
  
  if (!subcategoryInfo) {
    return {
      title: `Subcategory Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested subcategory could not be found.'
    };
  }
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  
  return createMetadata({
    title: `${subcategoryInfo.label} ${categoryLabel} Laser Cleaning`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials. ${subcategoryInfo.materials.length} materials available.`,
    keywords: [
      `${subcategoryInfo.label} laser cleaning`,
      `${categoryLabel} cleaning`,
      `${subcategoryInfo.label} ${categoryLabel}`,
      'laser surface treatment'
    ],
    slug: `materials/${category}/${subcategory}`,
    canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}`,
  });
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfo(category, subcategory);
  
  if (!subcategoryInfo) {
    notFound();
  }
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = `${subcategoryInfo.label} ${categoryLabel}`;
  const pageUrl = `${SITE_CONFIG.url}/materials/${category}/${subcategory}`;
  
  // Generate comprehensive JSON-LD schemas using @graph pattern
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        'name': `${pageTitle} Laser Cleaning`,
        'description': `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials. ${subcategoryInfo.materials.length} materials available.`,
        'url': pageUrl,
        'publisher': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'breadcrumb': {
          '@id': `${pageUrl}#breadcrumb`
        },
        'mainEntity': {
          '@id': `${pageUrl}#itemlist`
        }
      },
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
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
            'name': categoryLabel,
            'item': `${SITE_CONFIG.url}/materials/${category}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': subcategoryInfo.label,
            'item': pageUrl
          }
        ]
      },
      
      // 3. ItemList schema for materials
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#itemlist`,
        'numberOfItems': subcategoryInfo.materials.length,
        'itemListElement': subcategoryInfo.materials.map((material, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': material.name,
          'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${material.slug}`,
          'item': {
            '@type': 'Article',
            '@id': `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${material.slug}`,
            'name': material.name,
            'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${material.slug}`
          }
        }))
      },
      
      // 4. Dataset schema for subcategory-level data aggregation
      {
        '@type': 'Dataset',
        '@id': `${pageUrl}#dataset`,
        'name': `${pageTitle} Laser Cleaning Parameters Dataset`,
        'description': `Comprehensive dataset of ${subcategoryInfo.materials.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials with laser cleaning parameters, machine settings, and material properties.`,
        'url': pageUrl,
        'creator': {
          '@type': 'Organization',
          '@id': `${SITE_CONFIG.url}#organization`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'license': 'https://creativecommons.org/licenses/by/4.0/',
        'keywords': [
          subcategoryInfo.label,
          categoryLabel,
          'laser cleaning',
          'material properties',
          'machine settings'
        ],
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
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}-${subcategory}.json`,
            'description': `JSON format dataset with ${subcategoryInfo.materials.length} materials`
          },
          {
            '@type': 'DataDownload',
            'encodingFormat': 'text/csv',
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}-${subcategory}.csv`,
            'description': `CSV format dataset with ${subcategoryInfo.materials.length} materials`
          }
        ],
        'hasPart': subcategoryInfo.materials.map((material) => ({
          '@type': 'Dataset',
          'name': material.name,
          'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${material.slug}`
        }))
      },
      
      // 5. WebPage schema
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        'name': `${pageTitle} Laser Cleaning`,
        'description': `Explore ${subcategoryInfo.materials.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials for laser cleaning applications`,
        'url': pageUrl,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}#website`,
          'name': SITE_CONFIG.name,
          'url': SITE_CONFIG.url
        },
        'breadcrumb': {
          '@id': `${pageUrl}#breadcrumb`
        },
        'mainEntity': {
          '@id': `${pageUrl}#dataset`
        }
      }
    ]
  };
  
  // Get material slugs for this subcategory
  const materialSlugs = subcategoryInfo.materials.map(m => m.slug);
  
  // Prepare metadata for Layout
  const schemaData = {
    title: `${pageTitle} Laser Cleaning`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials`,
    category: category,
    subcategory: subcategory,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: categoryLabel, href: `/materials/${category}` },
      { label: subcategoryInfo.label, href: `/materials/${category}/${subcategory}` }
    ]
  };
  
  return (
    <>
      <JsonLD data={schemas} />
      <Layout
        title={`${subcategoryInfo.label} ${categoryLabel}`}
        subtitle={`${subcategoryInfo.materials.length} materials available for laser cleaning`}
        description={`Explore laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials`}
        metadata={schemaData as any}
        slug={`materials/${category}/${subcategory}`}
        fullWidth
      >
        {/* Materials Grid */}
        <section className={CONTAINER_STYLES.standard}>
          <CardGridSSR
            slugs={materialSlugs}
            columns={3}
            mode="simple"
            showBadgeSymbols={true}
            loadBadgeSymbolData={true}
          />
        </section>
      </Layout>
    </>
  );
}
