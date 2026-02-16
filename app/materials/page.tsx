// app/materials/page.tsx
// Main materials overview page - displays all material categories

import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/materialCategories';
import { CollectionPage } from '@/app/components/CollectionPage/CollectionPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false; // 1 hour ISR in production

// Viewport configuration for mobile optimization
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
  const categories = await getAllCategories();
  
  // Map to CollectionPageCategory format with items property
  const mappedCategories = categories.map(cat => ({
    ...cat,
    items: cat.materials // CollectionPage expects items property
  }));
  
  return <CollectionPage config={{
    type: 'materials',
    plural: 'Materials',
    rootPath: 'materials',
    pageTitle: 'Material Categories',
    pageDescription: 'Explore laser cleaning parameters and machine settings for every material type',
    categories: mappedCategories
  }} />;
}
