// app/applications/page.tsx
// Main applications overview page

import { createMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config';
import { getAllCategories } from '@/app/utils/applicationCategories';
import { CollectionPage } from '@/app/components/CollectionPage/CollectionPage';

export const dynamic = 'force-static';
export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : false;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export async function generateMetadata() {
  return createMetadata({
    title: 'Applications',
    description: 'Explore laser cleaning applications across aerospace, automotive, electronics, medical devices, and more.',
    keywords: ['laser cleaning applications', 'aerospace', 'automotive', 'electronics', 'medical devices', 'energy', 'defense'],
    slug: 'applications',
    canonical: `${SITE_CONFIG.url}/applications`,
  });
}

export default async function ApplicationsPage() {
  const categories = await getAllCategories();

  const mappedCategories = categories.flatMap(cat => {
    if (!cat.subcategories || cat.subcategories.length === 0) {
      return [{
        slug: cat.slug,
        label: cat.label,
        items: cat.applications
      }];
    }

    return cat.subcategories.map(sub => ({
      slug: sub.applications?.[0]?.slug || sub.slug,
      label: sub.label,
      items: sub.applications
    }));
  });

  return (
    <CollectionPage
      config={{
        type: 'applications',
        plural: 'Applications',
        rootPath: 'applications',
        pageTitle: 'Applications',
        pageDescription: 'Explore laser cleaning applications across key industries and use cases.',
        categories: mappedCategories
      }}
    />
  );
}
