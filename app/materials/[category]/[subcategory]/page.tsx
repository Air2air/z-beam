// app/[category]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import { getAllCategories, getSubcategoryInfo } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { CardGridSSR } from "@/app/components/CardGrid";
import { createMetadata } from "@/app/utils/metadata";
import { generateSubcategoryAuthorSchema } from '@/app/utils/schemas/personSchemas';
import { generateCollectionPageSchema, generateWebPageSchema, generateItemListSchema } from '@/app/utils/schemas/collectionPageSchema';
import { generateDatasetSchema, generateDatasetDistributions } from '@/app/utils/schemas/datasetSchema';

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
  const pageDescription = `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials. ${subcategoryInfo.materials.length} materials available.`;
  
  // Generate comprehensive JSON-LD schemas using @graph pattern with utilities
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: pageUrl,
        name: `${pageTitle} Laser Cleaning`,
        description: pageDescription,
        numberOfItems: subcategoryInfo.materials.length,
        itemListElement: subcategoryInfo.materials.map((material, index) => ({
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
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Materials', 'item': `${SITE_CONFIG.url}/materials` },
          { '@type': 'ListItem', 'position': 3, 'name': categoryLabel, 'item': `${SITE_CONFIG.url}/materials/${category}` },
          { '@type': 'ListItem', 'position': 4, 'name': subcategoryInfo.label, 'item': pageUrl }
        ]
      },
      
      // 3. ItemList schema for materials
      generateItemListSchema({
        url: pageUrl,
        name: `${pageTitle} Laser Cleaning`,
        description: pageDescription,
        items: subcategoryInfo.materials.map(mat => ({
          name: mat.name,
          url: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${mat.slug}`
        }))
      }),
      
      // 4. Dataset schema for subcategory-level data aggregation
      {
        ...generateDatasetSchema({
          url: pageUrl,
          name: `${pageTitle} Laser Cleaning Parameters Dataset`,
          description: `Comprehensive dataset of ${subcategoryInfo.materials.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials with laser cleaning parameters, machine settings, and material properties. Includes thermal, optical, mechanical, and laser interaction properties validated against industry standards.`,
          keywords: [subcategoryInfo.label, categoryLabel, 'laser cleaning', 'material properties', 'machine settings'],
          distribution: generateDatasetDistributions({
            baseUrl: SITE_CONFIG.url,
            slug: `${category}-${subcategory}`,
            name: `${pageTitle} Materials`
          }),
          spatialCoverage: 'Global',
          temporalCoverage: '2024/..',
          variableMeasured: [
            'wavelength', 'power', 'fluence', 'pulse duration', 'repetition rate',
            'scan speed', 'thermal conductivity', 'hardness', 'ablation threshold'
          ]
        }),
        'alternateName': `${pageTitle} Materials Database`,
        'hasPart': subcategoryInfo.materials.map((material) => ({
          '@type': 'Dataset',
          'name': material.name,
          'url': `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${material.slug}`
        }))
      },
      
      // 5. WebPage schema
      generateWebPageSchema({
        url: pageUrl,
        name: `${pageTitle} Laser Cleaning`,
        description: `Explore ${subcategoryInfo.materials.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials for laser cleaning applications`,
        breadcrumbId: `${pageUrl}#breadcrumb`,
        authorId: `${SITE_CONFIG.url}#author-technical-team`
      }),
      
      // 6. Person schema - Technical author with E-E-A-T enhancements
      generateSubcategoryAuthorSchema(category, categoryLabel, subcategory, subcategoryInfo.label)
    ]
  };
  
  // Get material slugs for this subcategory
  const materialSlugs = subcategoryInfo.materials.map(m => m.slug);
  
  // Prepare metadata for Layout
  const metadata = {
    title: `${pageTitle} Laser Cleaning`,
    description: `${subcategoryInfo.materials.length} materials available for laser cleaning`,
    metaDescription: pageDescription,
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
        description={`${subcategoryInfo.materials.length} materials available for laser cleaning`}
        metadata={metadata as any}
        slug={`materials/${category}/${subcategory}`}
      >
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{subcategoryInfo.label}</h2>
          <CardGridSSR
            slugs={materialSlugs}
            columns={3}
            mode="simple"
            showBadgeSymbols={true}
            loadBadgeSymbolData={true}
          />
        </div>
      </Layout>
    </>
  );
}
