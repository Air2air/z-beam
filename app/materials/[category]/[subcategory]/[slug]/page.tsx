// app/[category]/[subcategory]/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getArticle, getSettingsArticle } from "@/app/utils/contentAPI";
import { getAllCategories } from "@/app/utils/materialCategories";
import { MaterialsLayout } from "@/app/components/MaterialsLayout/MaterialsLayout";
import { MaterialJsonLD } from "@/app/components/JsonLD/JsonLD";
import { createMetadata, type ArticleMetadata } from "@/app/utils/metadata";
import { SITE_CONFIG } from "@/app/utils/constants";
import { normalizeForUrl } from "@/app/utils/urlBuilder";

export const dynamic = 'force-static';
export const revalidate = false;

interface MaterialPageProps {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
}

// Generate static params for all materials
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params: { category: string; subcategory: string; slug: string }[] = [];
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      for (const material of subcategory.materials) {
        params.push({
          category: category.slug,
          subcategory: subcategory.slug,
          slug: material.slug
        });
      }
    }
  }
  
  return params;
}

// Generate metadata
export async function generateMetadata({ params }: MaterialPageProps) {
  const { category, subcategory, slug } = await params;
  
  if (!slug) {
    return {
      title: `Page Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested page could not be found.'
    };
  }
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      return {
        title: `Page Not Found | ${SITE_CONFIG.shortName}`,
        description: 'The requested page could not be found.'
      };
    }
    
    // Verify category and subcategory match
    const articleMeta = article.metadata as any;
    const articleCategory = articleMeta.category ? normalizeForUrl(articleMeta.category) : undefined;
    const articleSubcategory = articleMeta.subcategory ? normalizeForUrl(articleMeta.subcategory) : undefined;
    
    if (articleCategory !== category || articleSubcategory !== subcategory) {
      // Wrong URL structure - will redirect in page component
      return {
        title: article.metadata.title || SITE_CONFIG.shortName,
        description: article.metadata.description || ''
      };
    }
    
    // Ensure material_description is passed for proper truncation in meta description
    const baseMetadata = createMetadata({
      ...article.metadata,
      material_description: (article.metadata as any).material_description,
      canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}`
    } as unknown as ArticleMetadata);
    
    // Add canonical URL via alternates
    return {
      ...baseMetadata,
      alternates: {
        canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}`
      }
    };
  } catch (error) {
    console.error(`Error generating metadata for ${slug}:`, error);
    return {
      title: SITE_CONFIG.shortName,
      description: 'Technical information about industrial lasers.'
    };
  }
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { category, subcategory, slug } = await params;

  if (!slug) {
    return notFound();
  }
  
  try {
    const article = await getArticle(slug);
    
    if (!article) {
      notFound();
    }
    
    // Verify category and subcategory match - redirect to correct URL if needed
    const metadata = article.metadata as any;
    const articleCategory = metadata.category ? normalizeForUrl(metadata.category) : undefined;
    const articleSubcategory = metadata.subcategory ? normalizeForUrl(metadata.subcategory) : undefined;
    
    if (articleCategory && articleSubcategory) {
      if (articleCategory !== category || articleSubcategory !== subcategory) {
        // Redirect to correct URL
        redirect(`/materials/${articleCategory}/${articleSubcategory}/${slug}`);
      }
    }
    
    // Prepare components
    const components = article.components || {};
    
    // Load machine settings from corresponding settings file for complete Dataset schema
    try {
      const baseMaterialSlug = slug.replace(/-laser-cleaning$/, '');
      const settings = await getSettingsArticle(`${baseMaterialSlug}-settings`);
      if (settings?.machineSettings) {
        // Merge machineSettings into article metadata for Dataset schema
        article.metadata = {
          ...article.metadata,
          machineSettings: settings.machineSettings
        };
      }
    } catch (_error) {
      // Settings file doesn't exist - continue without machine settings
    }
    
    return (
      <>
        <MaterialJsonLD article={article} slug={`materials/${category}/${subcategory}/${slug}`} />
        <MaterialsLayout 
          components={components as any} 
          metadata={article.metadata as unknown as ArticleMetadata} 
          slug={slug}
          category={category}
          subcategory={subcategory}
        />
      </>
    );
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
