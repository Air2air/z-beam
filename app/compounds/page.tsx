// app/compounds/page.tsx
// Compounds landing page - lists all compound categories

import { notFound } from 'next/navigation';
import { CardGrid } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getContentConfig } from '@/app/config/contentTypes';
import { COMPOUND_CATEGORY_METADATA } from '@/app/compoundMetadata';

export const dynamic = 'force-static';
export const revalidate = false;

const config = getContentConfig('compounds');

export async function generateMetadata() {
  return createMetadata({
    title: 'Hazardous Compounds from Laser Cleaning',
    description: 'Comprehensive database of hazardous compounds produced during laser cleaning operations, including toxicity data, exposure limits, and safety guidelines.',
    keywords: ['hazardous compounds', 'laser safety', 'toxic gases', 'exposure limits', 'industrial safety'],
    slug: 'compounds',
    canonical: `${SITE_CONFIG.url}/compounds`,
  });
}

export default async function CompoundsPage() {
  const categories = await config.getAllCategories();
  
  if (!categories || categories.length === 0) {
    notFound();
  }
  
  const pageTitle = 'Hazardous Compounds Database';
  const pageDescription = 'Comprehensive safety information for compounds produced during laser cleaning operations';
  
  const metadata = {
    title: pageTitle,
    slug: 'compounds',
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Compounds', href: '/compounds' }
    ]
  };

  return (
    <Layout metadata={metadata}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-xl text-gray-300">{pageDescription}</p>
        </header>
        
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryMeta = COMPOUND_CATEGORY_METADATA[category.slug];
            return (
              <section key={category.slug} className="mb-16">
                <CardGrid
                  items={category.items || []}
                  title={category.name}
                  description={categoryMeta?.subtitle || category.description}
                  variant="category"
                />
              </section>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
