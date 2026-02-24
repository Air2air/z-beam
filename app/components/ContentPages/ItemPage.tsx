// app/components/ContentPages/ItemPage.tsx
// Shared item page component for materials, contaminants, etc.

import { notFound, redirect } from 'next/navigation';
import { MaterialsLayout } from '@/app/components/MaterialsLayout/MaterialsLayout';
import { ContaminantsLayout } from '@/app/components/ContaminantsLayout/ContaminantsLayout';
import { CompoundsLayout } from '@/app/components/CompoundsLayout/CompoundsLayout';
import { SettingsLayout } from '@/app/components/SettingsLayout/SettingsLayout';
import { JsonLD } from '@/app/components/JsonLD/JsonLD';
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
    
    // SETTINGS PAGES: Use SettingsLayout with standardized metadata extraction
    if (config.type === 'settings') {
      // Extract metadata consistently with other content types
      const metadata = article.frontmatter || article as any;
      
      // Verify category/subcategory match for settings
      const settingsCategory = metadata.category ? normalizeForUrl(metadata.category) : undefined;
      const settingsSubcategory = metadata.subcategory ? normalizeForUrl(metadata.subcategory) : undefined;
      
      if (settingsCategory && settingsSubcategory) {
        if (settingsCategory !== categorySlug || settingsSubcategory !== subcategorySlug) {
          redirect(`/${config.rootPath}/${settingsCategory}/${settingsSubcategory}/${itemSlug}`);
        }
      }
      
      // Ensure schema generator can find title - wrap metadata in frontmatter structure
      // Settings files have pageTitle but SchemaFactory expects consistent structure
      const articleForSchema = { frontmatter: metadata };
      
      return (
        <>
          <JsonLD 
            article={articleForSchema} 
            slug={`${config.rootPath}/${categorySlug}/${subcategorySlug}/${itemSlug}`} 
          />
          <SettingsLayout 
            metadata={metadata}
            materialProperties={metadata?.relationships?.materialProperties}
            category={categorySlug}
            subcategory={subcategorySlug}
            slug={itemSlug}
          />
        </>
      );
    }
    
    // MATERIALS & CONTAMINANTS: Standard article structure with metadata and components
    // Extract metadata from article
    const metadata = article.frontmatter as any;
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
        // Use camelCase property (normalizer ensures this exists)
        const machineSettings = (settings as any)?.machineSettings;
        
        if (machineSettings) {
          // Merge machineSettings at TOP LEVEL of article.frontmatter for Dataset schema
          // SchemaFactory checks frontmatter.machineSettings, not nested in relationships
          if (!article.frontmatter) {
            article.frontmatter = {};
          }
          (article.frontmatter as any).machineSettings = machineSettings;
        }
      } catch (_error) {
        // Settings file doesn't exist - continue without machine settings
      }
    }
    
    return (
      <>
        <JsonLD 
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
        ) : config.type === 'compounds' ? (
          <CompoundsLayout 
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
