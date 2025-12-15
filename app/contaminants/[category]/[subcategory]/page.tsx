// app/contaminants/[category]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import { getAllCategories, getSubcategoryInfo } from "@/app/utils/contaminantCategories";
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
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  
  return createMetadata({
    title: `${subcategoryInfo.label} ${categoryLabel} Contamination Removal`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} contamination. ${subcategoryInfo.contaminants.length} contaminants cataloged.`,
    keywords: [
      `${subcategoryInfo.label} removal`,
      `${categoryLabel} cleaning`,
      `${subcategoryInfo.label} ${categoryLabel}`,
      'contamination removal'
    ],
    slug: `contaminants/${category}/${subcategory}`,
    canonical: `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}`,
  });
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfo(category, subcategory);
  
  if (!subcategoryInfo) {
    notFound();
  }
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
  const pageTitle = `${subcategoryInfo.label} ${categoryLabel}`;
  const pageUrl = `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}`;
  const pageDescription = `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} contamination. ${subcategoryInfo.contaminants.length} contaminants cataloged.`;
  
  // Generate comprehensive JSON-LD schemas using @graph pattern with utilities
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. CollectionPage schema
      generateCollectionPageSchema({
        url: pageUrl,
        name: `${pageTitle} Contamination Removal`,
        description: pageDescription,
        numberOfItems: subcategoryInfo.contaminants.length,
        itemListElement: subcategoryInfo.contaminants.map((contaminant, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': contaminant.name,
          'url': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}/${contaminant.slug}`,
          'item': {
            '@type': 'Article',
            '@id': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}/${contaminant.slug}`,
            'name': contaminant.name,
            'url': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}/${contaminant.slug}`
          }
        }))
      }),
      
      // 2. BreadcrumbList schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.url },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contaminants', 'item': `${SITE_CONFIG.url}/contaminants` },
          { '@type': 'ListItem', 'position': 3, 'name': categoryLabel, 'item': `${SITE_CONFIG.url}/contaminants/${category}` },
          { '@type': 'ListItem', 'position': 4, 'name': subcategoryInfo.label, 'item': pageUrl }
        ]
      },
      
      // 3. ItemList schema for contaminants
      generateItemListSchema({
        url: pageUrl,
        name: `${pageTitle} Contamination Removal`,
        description: pageDescription,
        items: subcategoryInfo.contaminants.map(cont => ({
          name: cont.name,
          url: `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}/${cont.slug}`
        }))
      }),
      
      // 4. Dataset schema for subcategory-level data aggregation
      {
        ...generateDatasetSchema({
          url: pageUrl,
          name: `${pageTitle} Contamination Removal Dataset`,
          description: `Comprehensive dataset of ${subcategoryInfo.contaminants.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} contaminants with laser cleaning parameters, removal techniques, and contamination properties. Includes chemical composition, adhesion characteristics, and removal protocols validated against industry standards.`,
          keywords: [subcategoryInfo.label, categoryLabel, 'contamination removal', 'laser cleaning', 'industrial cleaning'],
          distribution: generateDatasetDistributions({
            baseUrl: SITE_CONFIG.url,
            slug: `${category}-${subcategory}`,
            name: `${pageTitle} Contaminants`
          }),
          spatialCoverage: 'Global',
          temporalCoverage: '2024/..',
          variableMeasured: [
            'wavelength', 'power', 'fluence', 'pulse duration', 'repetition rate',
            'scan speed', 'adhesion strength', 'layer thickness', 'removal threshold'
          ]
        }),
        'alternateName': `${pageTitle} Contaminants Database`,
        'hasPart': subcategoryInfo.contaminants.map((contaminant) => ({
          '@type': 'Dataset',
          'name': contaminant.name,
          'url': `${SITE_CONFIG.url}/contaminants/${category}/${subcategory}/${contaminant.slug}`
        }))
      },
      
      // 5. WebPage schema
      generateWebPageSchema({
        url: pageUrl,
        name: `${pageTitle} Contamination Removal`,
        description: `Explore ${subcategoryInfo.contaminants.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} contaminants for laser cleaning applications`,
        breadcrumbId: `${pageUrl}#breadcrumb`,
        authorId: `${SITE_CONFIG.url}#author-technical-team`
      }),
      
      // 6. Person schema - Technical author with E-E-A-T enhancements
      generateSubcategoryAuthorSchema(category, categoryLabel, subcategory, subcategoryInfo.label)
    ]
  };
  
  // Get contaminant slugs for this subcategory
  const contaminantSlugs = subcategoryInfo.contaminants.map(c => c.slug);
  
  // Prepare metadata for Layout
  const metadata = {
    title: `${pageTitle} Contamination Removal`,
    description: `${subcategoryInfo.contaminants.length} contaminants cataloged for laser cleaning`,
    metaDescription: pageDescription,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: categoryLabel, href: `/contaminants/${category}` },
      { label: subcategoryInfo.label, href: `/contaminants/${category}/${subcategory}` }
    ]
  };
  
  return (
    <>
      <JsonLD data={schemas} />
      <Layout
        title={`${subcategoryInfo.label} ${categoryLabel}`}
        description={`${subcategoryInfo.contaminants.length} contaminants cataloged for laser cleaning`}
        metadata={metadata as any}
        slug={`contaminants/${category}/${subcategory}`}
      >
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{subcategoryInfo.label}</h2>
          <CardGridSSR
            slugs={contaminantSlugs}
            columns={3}
            mode="contaminants"
            showBadgeSymbols={true}
            loadBadgeSymbolData={true}
          />
        </div>
      </Layout>
    </>
  );
}
