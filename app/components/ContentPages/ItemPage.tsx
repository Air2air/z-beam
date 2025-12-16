// app/components/ContentPages/ItemPage.tsx
// Shared item page component for materials, contaminants, etc.

import { notFound, redirect } from 'next/navigation';
import { MaterialsLayout } from '@/app/components/MaterialsLayout/MaterialsLayout';
import { ContaminantsLayout } from '@/app/components/ContaminantsLayout/ContaminantsLayout';
import { MaterialJsonLD } from '@/app/components/JsonLD/JsonLD';
import { ContentTypeConfig } from '@/app/config/contentTypes';
import { normalizeForUrl } from '@/app/utils/urlBuilder';
import { getSettingsArticle } from '@/app/utils/contentAPI';
import type { ArticleMetadata } from '@/app/utils/metadata';

interface ItemPageProps {
  config: ContentTypeConfig;
  categorySlug: string;
  subcategorySlug: string;
  itemSlug: string;
}

export async function ItemPage({
  config,
  categorySlug,
  subcategorySlug,
  itemSlug
}: ItemPageProps) {
  if (!itemSlug) {
    return notFound();
  }
  
  try {
    const article = await config.getArticle(itemSlug);
    
    if (!article) {
      notFound();
    }
    
    // Extract metadata from article
    const metadata = article.metadata as any;
    const articleCategory = metadata?.category ? normalizeForUrl(metadata.category) : undefined;
    const articleSubcategory = metadata?.subcategory ? normalizeForUrl(metadata.subcategory) : undefined;
    
    if (articleCategory && articleSubcategory) {
      if (articleCategory !== categorySlug || articleSubcategory !== subcategorySlug) {
        // Redirect to correct URL
        redirect(`/${config.rootPath}/${articleCategory}/${articleSubcategory}/${itemSlug}`);
      }
    }
    
    // Prepare components
    const components = article.components || {};
    
    // Load machine settings if applicable (materials only)
    if (config.hasSettings) {
      try {
        const baseMaterialSlug = itemSlug.replace(/-laser-cleaning$/, '');
        const settings = await getSettingsArticle(`${baseMaterialSlug}-settings`);
        if (settings?.machineSettings) {
          // Merge machineSettings into article for Dataset schema
          Object.assign(article, { machineSettings: settings.machineSettings });
        }
      } catch (_error) {
        // Settings file doesn't exist - continue without machine settings
      }
    }
    
    return (
      <>
        <MaterialJsonLD 
          article={article} 
          slug={`${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`} 
        />
        {config.type === 'contaminants' ? (
          <ContaminantsLayout 
            components={components as any} 
            metadata={metadata as unknown as ArticleMetadata} 
            slug={itemSlug}
            category={categorySlug}
            subcategory={subcategorySlug}
          />
        ) : (
          <MaterialsLayout 
            components={components as any} 
            metadata={metadata as unknown as ArticleMetadata} 
            slug={itemSlug}
            category={categorySlug}
            subcategory={subcategorySlug}
          />
        )}
      </>
    );
  } catch (error) {
    console.error(`Error rendering page for ${itemSlug}:`, error);
    notFound();
  }
}
