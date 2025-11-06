// app/datasets/page.tsx
import { Layout } from '@/app/components/Layout/Layout';
import { SectionContainer } from '@/app/components/SectionContainer';
import MaterialBrowserWithFilters from '@/app/components/Dataset/MaterialBrowserWithFilters';
import DatasetsContent from '@/app/components/Dataset/DatasetsContent';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';
import { loadPageData } from '@/app/utils/contentAPI';

export const metadata = {
  title: 'Materials Database - Laser Cleaning Parameters | Z-Beam',
  description: 'Comprehensive database of 132 materials with laser cleaning specifications. Download in JSON, CSV, or TXT formats. Free and open-source with CC BY 4.0 license.',
  keywords: [
    'materials database',
    'laser cleaning parameters',
    'dataset download',
    'material properties',
    'laser specifications',
    'open data',
    'manufacturing data'
  ],
  openGraph: {
    title: 'Materials Database - Laser Cleaning Parameters',
    description: '132 materials with comprehensive laser cleaning specifications',
    type: 'website',
  }
};

export default async function DatasetsPage() {
  // Load page data including breadcrumb from datasets.yaml
  const pageData = await loadPageData('datasets');
  
  // Fetch the index file at build time
  const indexData = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/datasets/materials/index.json`,
    { next: { revalidate: 3600 } }
  ).then(res => res.json()).catch(() => ({
    datasets: [],
    totalDatasets: 0
  }));

  const materials = indexData.datasets || [];
  const totalDatasets = indexData.totalDatasets || materials.length;

  // Calculate category counts
  const categoryStats = materials.reduce((acc: Record<string, number>, material: any) => {
    acc[material.category] = (acc[material.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Schema.org DataCatalog */}
      {/* Schema.org DataCatalog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataCatalog',
            name: 'Z-Beam Laser Cleaning Materials Database',
            description: 'Comprehensive database of laser cleaning parameters for 132+ materials including metals, woods, stones, composites, and more.',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://z-beam.com'}/datasets`,
            license: 'https://creativecommons.org/licenses/by/4.0/',
            dateModified: new Date().toISOString().split('T')[0],
            creator: {
              '@type': 'Organization',
              name: 'Z-Beam',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://z-beam.com',
              email: 'info@z-beam.com'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: ['application/json', 'text/csv', 'text/plain'],
              contentUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://z-beam.com'}/datasets/materials/`
            },
            temporalCoverage: '2024/..',
            spatialCoverage: {
              '@type': 'Place',
              name: 'Global'
            }
          })
        }}
      />

      {/* Schema.org BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': process.env.NEXT_PUBLIC_SITE_URL || 'https://z-beam.com'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Datasets',
                'item': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://z-beam.com'}/datasets`
              }
            ]
          })
        }}
      />

      <Layout 
        title="Materials Database for Laser Cleaning"
        subtitle={`${totalDatasets} materials with comprehensive laser cleaning specifications`}
        slug="datasets"
        metadata={pageData.metadata as any}
        fullWidth
      >
        <div className={CONTAINER_STYLES.main}>
          <DatasetsContent 
            materials={materials}
            categoryStats={categoryStats}
          />
        </div>
      </Layout>
    </>
  );
}
