// app/components/ContentPages/ListingPage.tsx
// Shared listing page component for content type root pages

import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
import { SITE_CONFIG } from '@/app/config';
import { ContentTypeConfig } from '@/app/config/contentTypes';
import { GridItem } from '@/types';

interface ListingPageProps {
  config: ContentTypeConfig;
  categories: any[]; // Category data structure from getAllCategories
  pageTitle: string;
  pageDescription: string;
  schemas: any; // JSON-LD schemas
  categoryCards?: GridItem[]; // Optional: pre-formatted cards for category view
  displayMode?: 'categories' | 'full-list'; // Show just categories or full item list
}

export function ListingPage({
  config,
  categories,
  pageTitle,
  pageDescription,
  schemas,
  categoryCards,
  displayMode = 'full-list'
}: ListingPageProps) {
  const metadata = {
    title: pageTitle,
    description: pageDescription,
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: config.plural, href: `/${config.rootPath}` }
    ]
  };

  return (
    <>
      <JsonLD data={schemas} />
      <Layout 
        title={pageTitle} 
        description={pageDescription} 
        metadata={metadata as any}
        slug={config.rootPath}
      >
        {displayMode === 'categories' && categoryCards ? (
          // Show category cards only (like materials page)
          <div className="mb-8">
            <CardGridSSR
              items={categoryCards}
              columns={3}
              variant="default"
            />
          </div>
        ) : (
          // Show full item list grouped by category/subcategory (like contaminants/settings)
          <>
            {categories.map((category) => (
              <div key={category.slug} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">{category.label}</h2>
                
                {category.subcategories.map((subcategory: any) => {
                  // Get items array based on content type
                  const items = subcategory[config.itemsProperty] || subcategory.contaminants || [];
                  
                  return (
                    <div key={subcategory.slug} className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">{subcategory.label}</h3>
                      <CardGridSSR
                        slugs={items.map((item: any) => item.slug)}
                        columns={3}
                        contentType={config.type}
                        showBadgeSymbols={config.type === 'materials'}
                        loadBadgeSymbolData={config.type === 'materials'}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </Layout>
    </>
  );
}
