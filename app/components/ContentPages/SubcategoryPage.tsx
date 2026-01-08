// app/components/ContentPages/SubcategoryPage.tsx
// Shared subcategory page component for materials, contaminants, etc.

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { ContentTypeConfig } from '@/app/config/contentTypes';
import { getItemsFromSubcategory, formatCategoryName, buildBreadcrumbs } from '@/app/utils/contentPages/helpers';
import { generateSubcategorySchemas } from '@/app/utils/contentPages/schemas';

interface SubcategoryPageProps {
  config: ContentTypeConfig;
  categorySlug: string;
  subcategorySlug: string;
  subcategoryInfo: any;
}

export function SubcategoryPage({
  config,
  categorySlug,
  subcategorySlug,
  subcategoryInfo
}: SubcategoryPageProps) {
  if (!subcategoryInfo) {
    notFound();
  }
  
  const categoryLabel = formatCategoryName(categorySlug);
  const pageTitle = `${subcategoryInfo.label} ${categoryLabel}`;
  const items = getItemsFromSubcategory(subcategoryInfo, config);
  const pageDescription = `${config.purposeText} ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} ${config.itemsProperty}. ${items.length} ${config.itemsProperty} cataloged.`;
  
  // Build metadata with breadcrumbs
  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: buildBreadcrumbs(config, { 
      category: categorySlug, 
      subcategory: subcategorySlug 
    })
  };
  
  // Generate schemas
  const schemas = generateSubcategorySchemas(
    config,
    categorySlug,
    subcategorySlug,
    subcategoryInfo,
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
        slug={`${config.rootPath}/${categorySlug}/${subcategorySlug}`}
      >
        <CardGridSSR
          slugs={items.map((item: any) => item.slug)}
          columns={3}
          contentType={config.type}
          showBadgeSymbols={config.type === 'materials'}
          loadBadgeSymbolData={config.type === 'materials'}
        />
      </Layout>
    </>
  );
}
