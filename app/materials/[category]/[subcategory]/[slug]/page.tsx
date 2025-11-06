// app/[category]/[subcategory]/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getArticle, getAllArticleSlugs } from "@/app/utils/contentAPI";
import { getAllCategories } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { MaterialJsonLD } from "@/app/components/JsonLD/JsonLD";
import { createMetadata, type ArticleMetadata } from "@/app/utils/metadata";
import { getTagsContentWithMatchCounts } from "@/app/utils/tags";
import { RelatedMaterials } from "@/app/components/RelatedMaterials/RelatedMaterials";
import MaterialDatasetCardWrapper from "@/app/components/Dataset/MaterialDatasetCardWrapper";
import { SectionContainer } from "@/app/components/SectionContainer/SectionContainer";
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
    
    // Load tags content with match counts
    const { content: tagsContent, counts: tagCounts } = await getTagsContentWithMatchCounts(slug);
    
    // Prepare components with tags
    const components = article.components || {};
    
    if (tagsContent && components.tags) {
      components.tags = {
        ...components.tags,
        content: tagsContent,
        config: {
          ...(components.tags.config || {}),
          articleMatchCount: tagCounts
        }
      };
    }
    
    return (
      <>
        <MaterialJsonLD article={article} slug={`materials/${category}/${subcategory}/${slug}`} />
        <Layout components={components as any} metadata={article.metadata as unknown as ArticleMetadata} slug={`materials/${category}/${subcategory}/${slug}`} />
        <div className={`${CONTAINER_STYLES.main} mb-16`}>
          <RelatedMaterials 
            currentSlug={slug}
            category={category}
            subcategory={subcategory}
            maxItems={6}
          />
        </div>
        <div className={CONTAINER_STYLES.main}>
          <SectionContainer title={`${(article.metadata.title as string) || slug} Dataset Download`} bgColor="navbar" horizPadding={true} radius={true}>
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
          </SectionContainer>
        </div>
      </>
    );
  } catch (error) {
    console.error(`Error rendering page for ${slug}:`, error);
    notFound();
  }
}
