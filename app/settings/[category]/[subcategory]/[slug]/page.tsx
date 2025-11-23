// app/settings/[category]/[subcategory]/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { getAllCategories } from '@/app/utils/materialCategories';
import { getSettingsArticle, getArticleBySlug } from '@/app/utils/contentAPI';
import { SettingsLayout } from '@/app/components/SettingsLayout';
import { SettingsJsonLD } from '@/app/components/JsonLD/SettingsJsonLD';
import { createMetadata, type ArticleMetadata } from '@/app/utils/metadata';
import { SITE_CONFIG } from '@/app/config/site';
import { normalizeForUrl } from '@/app/utils/urlBuilder';

interface SettingsPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    slug: string;
  }>;
}

/**
 * Generate static paths for all settings pages (mirrors materials taxonomy)
 */
export async function generateStaticParams() {
  const categories = await getAllCategories();
  
  return categories.flatMap((cat) =>
    cat.subcategories.flatMap((subcat) =>
      subcat.materials.map((material) => ({
        category: cat.slug,
        subcategory: subcat.slug,
        slug: material.slug,
      }))
    )
  );
}

/**
 * Generate metadata for SEO with enhanced OpenGraph, Twitter cards, and canonical URLs
 */
export async function generateMetadata({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;
  
  if (!slug) {
    return {
      title: `Settings Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested settings page could not be found.'
    };
  }
  
  try {
    // Strip -laser-cleaning suffix if present to get base material name
    const baseMaterialSlug = slug.replace(/-laser-cleaning$/, '');
    const settings = await getSettingsArticle(`${baseMaterialSlug}-settings`);

    if (!settings) {
      return {
        title: `Settings Not Found | ${SITE_CONFIG.shortName}`,
        description: 'Machine settings page not found.',
      };
    }

    // Verify category and subcategory match
    const settingsCategory = settings.category ? normalizeForUrl(settings.category) : undefined;
    const settingsSubcategory = settings.subcategory ? normalizeForUrl(settings.subcategory) : undefined;
    
    if (settingsCategory !== category || settingsSubcategory !== subcategory) {
      // Wrong URL structure - will redirect in page component
      return {
        title: settings.title || SITE_CONFIG.shortName,
        description: settings.description || ''
      };
    }

    // Use createMetadata for enhanced OpenGraph, Twitter cards, canonical URLs
    return createMetadata({
      title: settings.seo_settings_page?.title || settings.title,
      description: settings.seo_settings_page?.description || settings.settings_description || settings.description,
      settings_description: settings.settings_description,
      keywords: settings.seo_settings_page?.keywords || [],
      slug: `settings/${category}/${subcategory}/${slug}-settings`,
      canonical: `${SITE_CONFIG.url}/settings/${category}/${subcategory}/${slug}`,
      author: settings.author,
      category: settings.category,
      name: settings.name,
    } as unknown as ArticleMetadata);
  } catch (error) {
    console.error(`Error generating metadata for settings ${slug}:`, error);
    return {
      title: SITE_CONFIG.shortName,
      description: 'Laser cleaning machine settings and parameters.'
    };
  }
}

/**
 * Settings page component with URL validation and redirects
 * 
 * Uses {material}-settings.yaml naming convention
 * Material properties auto-loaded via materialRef in settings file
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;

  if (!slug) {
    return notFound();
  }
  
  try {
    // Strip -laser-cleaning suffix if present to get base material name
    const baseMaterialSlug = slug.replace(/-laser-cleaning$/, '');
    
    // Load settings using {material}-settings naming convention
    const settings = await getSettingsArticle(`${baseMaterialSlug}-settings`);
    const settingsSlug = `${baseMaterialSlug}-settings`;

    if (!settings) {
      notFound();
    }

    // Verify category and subcategory match - redirect to correct URL if needed
    const settingsCategory = settings.category ? normalizeForUrl(settings.category) : undefined;
    const settingsSubcategory = settings.subcategory ? normalizeForUrl(settings.subcategory) : undefined;
    
    if (settingsCategory && settingsSubcategory) {
      if (settingsCategory !== category || settingsSubcategory !== subcategory) {
        // Redirect to correct URL
        redirect(`/settings/${settingsCategory}/${settingsSubcategory}/${slug}`);
      }
    }

    // NEW: Material properties are auto-loaded via materialRef, but we can override
    // Load material properties from frontmatter for data interpolation (backward compatibility)
    const materialArticle = await getArticleBySlug(`materials/${category}/${subcategory}/${slug}-laser-cleaning`) as any;
    const materialProps = materialArticle?.materialProperties;

    return (
      <>
        {/* Schema.org JSON-LD */}
        <SettingsJsonLD 
          settings={settings} 
          category={category}
          subcategory={subcategory}
          slug={settingsSlug}
        />

        {/* SettingsLayout handles all standard components automatically */}
        <SettingsLayout
          settings={settings}
          materialProperties={materialProps}
          category={category}
          subcategory={subcategory}
          slug={settingsSlug}
        >
          {/* Optional: Additional custom content can be added here */}
        </SettingsLayout>
      </>
    );
  } catch (error) {
    console.error(`Error rendering settings page for ${slug}:`, error);
    notFound();
  }
}
