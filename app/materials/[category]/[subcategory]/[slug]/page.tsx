// app/[category]/[subcategory]/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getArticle, getAllArticleSlugs, getSettingsArticle } from "@/app/utils/contentAPI";
import { getAllCategories } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { MaterialJsonLD } from "@/app/components/JsonLD/JsonLD";
import { createMetadata, type ArticleMetadata } from "@/app/utils/metadata";
import { RelatedMaterials } from "@/app/components/RelatedMaterials/RelatedMaterials";
import { RegulatoryStandards } from "@/app/components/RegulatoryStandards";
import MaterialDatasetCardWrapper from "@/app/components/Dataset/MaterialDatasetCardWrapper";
import { SITE_CONFIG } from "@/app/utils/constants";
import { CONTAINER_STYLES } from "@/app/utils/containerStyles";
import { normalizeForUrl } from "@/app/utils/urlBuilder";
import type { PageProps } from "@/types";

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
    const metadata = article.metadata as any;
    const articleCategory = metadata.category ? normalizeForUrl(metadata.category) : undefined;
    const articleSubcategory = metadata.subcategory ? normalizeForUrl(metadata.subcategory) : undefined;
    
    if (articleCategory !== category || articleSubcategory !== subcategory) {
      // Wrong URL structure - will redirect in page component
      return {
        title: article.metadata.title || SITE_CONFIG.shortName,
        description: article.metadata.description || ''
      };
    }
    
    return createMetadata({
      ...article.metadata,
      canonical: `${SITE_CONFIG.url}/materials/${category}/${subcategory}/${slug}`
    } as unknown as ArticleMetadata);
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
    } catch (error) {
      // Settings file doesn't exist - continue without machine settings
    }
    
    return (
      <>
        <MaterialJsonLD article={article} slug={`materials/${category}/${subcategory}/${slug}`} />
        <Layout 
          components={components as any} 
          metadata={article.metadata as unknown as ArticleMetadata} 
          slug={`materials/${category}/${subcategory}/${slug}`}
        >
          <div className="mb-16">
            <RelatedMaterials 
              currentSlug={slug}
              category={category}
              subcategory={subcategory}
              maxItems={6}
            />
          </div>
          
          {(article.metadata as any).regulatoryStandards && (article.metadata as any).regulatoryStandards.length > 0 && (
            <div className="mb-16">
              <RegulatoryStandards standards={(article.metadata as any).regulatoryStandards} />
            </div>
          )}
          
          <MaterialDatasetCardWrapper 
            material={{
              name: (article.metadata.title as string) || slug,
              slug: slug,
              category: category,
              subcategory: subcategory,
              parameters: (article.metadata as any).parameters,
              materialProperties: (article.metadata as any).materialProperties,
              applications: (article.metadata as any).applications,
              faq: (article.metadata as any).faq,
              regulatoryStandards: (article.metadata as any).regulatoryStandards,
              machineSettings: (article.metadata as any).machineSettings
            }}
            showFullDataset={true}
          />
        </Layout>
      </>
    );
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
