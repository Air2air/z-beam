// app/datasets/page.tsx
import { Layout } from '@/app/components/Layout/Layout';
import { Breadcrumbs } from '@/app/components/Navigation/breadcrumbs';
import DatasetHero from '@/app/components/Dataset/DatasetHero';
import CategoryGrid from '@/app/components/Dataset/CategoryGrid';
import MaterialBrowser from '@/app/components/Dataset/MaterialBrowser';
import BulkDownload from '@/app/components/Dataset/BulkDownload';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';

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

      <Layout fullWidth>
        <div className={CONTAINER_STYLES.standard}>
          {/* Breadcrumb */}
          <Breadcrumbs breadcrumbData={[
            { label: 'Home', href: '/' },
            { label: 'Datasets', href: '/datasets' }
          ]} />

          {/* Material Browser */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                All Materials
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Search and filter {totalDatasets} materials
              </p>
            </div>
            <MaterialBrowser materials={materials} />
          </section>

          {/* Bulk Download */}
          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Bulk Downloads
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Download complete datasets or category bundles
              </p>
            </div>
            <BulkDownload 
              materials={materials}
              categoryStats={categoryStats}
            />
          </section>
        </div>
      </Layout>
    </>
  );
}
