// app/[category]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import { getAllCategories, getSubcategoryInfo } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { SectionContainer } from "@/app/components/SectionContainer";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { CardGridSSR } from "@/app/components/CardGrid";
import { createMetadata } from "@/app/utils/metadata";
import SubcategoryDatasetWrapper from "@/app/components/Dataset/SubcategoryDatasetWrapper";
import { FiPackage } from "react-icons/fi";

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
            'name': 'Materials',
            'item': `${SITE_CONFIG.url}/materials`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': categoryLabel,
            'item': `${SITE_CONFIG.url}/materials/${category}`
          },
          {
            '@type': 'ListItem',
            'position': 4,
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
        'description': `Comprehensive dataset of ${subcategoryInfo.materials.length} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials with laser cleaning parameters, machine settings, and material properties. Includes thermal, optical, mechanical, and laser interaction properties validated against industry standards.`,
        'alternateName': `${pageTitle} Materials Database`,
        'url': pageUrl,
        'identifier': `${pageUrl}#dataset`,
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
        'inLanguage': 'en-US',
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
          },
          {
            '@type': 'DataDownload',
            'encodingFormat': 'text/plain',
            'contentUrl': `${SITE_CONFIG.url}/data/datasets/${category}-${subcategory}.txt`,
            'description': `Plain text format dataset with ${subcategoryInfo.materials.length} materials`
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
          '@id': `${pageUrl}#breadcrumb`
        },
        'mainEntity': {
          '@id': `${pageUrl}#dataset`
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
          `${pageTitle} laser cleaning`,
          `${categoryLabel} materials science`,
          'Industrial laser systems',
          'Laser ablation parameters',
          `${subcategoryInfo.label} material properties`
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
        'description': `Expert team specializing in laser cleaning research, material analysis, and industrial surface treatment applications for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials.`
      }
    ]
  };
  
  // Get material slugs for this subcategory
  const materialSlugs = subcategoryInfo.materials.map(m => m.slug);
  
  // Prepare metadata for Layout
  const metadata = {
    title: `${pageTitle} Laser Cleaning`,
    subtitle: `${subcategoryInfo.materials.length} materials available for laser cleaning`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials`,
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
        metadata={metadata as any}
        slug={`materials/${category}/${subcategory}`}
      >
        <SectionContainer title={subcategoryInfo.label} bgColor="transparent" radius={false} className="mb-8">
          <CardGridSSR
            slugs={materialSlugs}
            columns={3}
            mode="simple"
            showBadgeSymbols={true}
            loadBadgeSymbolData={true}
          />
        </SectionContainer>
        
        {/* Subcategory Dataset Section */}
        <SectionContainer 
          title={`${subcategoryInfo.label} Dataset Download`} 
          bgColor="navbar" 
          horizPadding={true} 
          radius={true}
          className="mb-8"
          icon={<FiPackage className="w-6 h-6 text-white" />}
        >
          <SubcategoryDatasetWrapper
            category={category}
            categoryLabel={categoryLabel}
            subcategory={subcategory}
            subcategoryLabel={subcategoryInfo.label}
            materials={subcategoryInfo.materials}
          />
        </SectionContainer>
      </Layout>
    </>
  );
}
