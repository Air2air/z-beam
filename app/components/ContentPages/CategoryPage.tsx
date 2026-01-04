// app/components/ContentPages/CategoryPage.tsx
// Shared category page component for materials, contaminants, etc.

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { ContentTypeConfig } from '@/app/config/contentTypes';
import { getItemsFromCategory, formatCategoryName, buildBreadcrumbs } from '@/app/utils/contentPages/helpers';
import { generateCategorySchemas } from '@/app/utils/contentPages/schemas';

interface CategoryPageProps {
  config: ContentTypeConfig;
  categorySlug: string;
  categoryData: any;
  categoryMetadata?: any;
}

export async function CategoryPage({
  config,
  categorySlug,
  categoryData,
  categoryMetadata
}: CategoryPageProps) {
  if (!categoryData) {
    notFound();
  }
  
  const categoryDisplayName = formatCategoryName(categorySlug);
  const pageTitle = categoryMetadata?.title || `${categoryDisplayName} ${config.actionText}`;
  const pageDescription = categoryMetadata?.description || 
    `${config.purposeText} ${categoryDisplayName.toLowerCase()} ${config.itemsProperty}. ${getItemsFromCategory(categoryData, config).length} ${config.itemsProperty} available.`;
  
  // Build metadata with breadcrumbs
  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: buildBreadcrumbs(config, { category: categorySlug })
  };
  
  // Generate schemas
  const schemas = generateCategorySchemas(
    config,
    categorySlug,
    categoryData,
    pageTitle,
    pageDescription
  );
  
  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle}
        pageDescription={pageDescription}
        metadata={metadata as any}
        slug={`${config.rootPath}/${categorySlug}`}
      >
        {/* Group items by subcategory */}
        {categoryData.subcategories?.map((subcategory: any) => {
          const items = subcategory[config.itemsProperty] || [];
          
          if (items.length === 0) return null;
          
          return (
            <div key={subcategory.slug} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{subcategory.label}</h3>
              <CardGridSSR
                slugs={items.map((item: any) => item.slug)}
                contentType={config.type}
                columns={3}
                showBadgeSymbols={config.type === 'materials'}
                loadBadgeSymbolData={config.type === 'materials'}
              />
            </div>
          );
        })}
      </Layout>
    </>
  );
}
