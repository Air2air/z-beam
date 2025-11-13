// app/settings/[category]/[subcategory]/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getAllCategories } from '@/app/utils/materialCategories';
import { getSettingsArticle, getArticleBySlug } from '@/app/utils/contentAPI';
import { SettingsLayout } from '@/app/components/SettingsLayout';
import { SettingsJsonLD } from '@/app/components/JsonLD/SettingsJsonLD';

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
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: SettingsPageProps) {
  const { slug } = await params;
  const settings = await getSettingsArticle(`${slug}-laser-cleaning`);

  if (!settings) {
    return {
      title: 'Settings Not Found',
      description: 'Machine settings page not found.',
    };
  }

  return {
    title: settings.seo_settings_page?.title || settings.title,
    description: settings.seo_settings_page?.description || settings.description,
    keywords: settings.seo_settings_page?.keywords?.join(', '),
  };
}

/**
 * Settings page component
 * 
 * NEW: File naming convention changed to {material}-settings.yaml
 * NEW: Material properties auto-loaded via materialRef in settings file
 */
export default async function SettingsPage({ params }: SettingsPageProps) {
  const { category, subcategory, slug } = await params;
  
  // NEW: Try new naming convention first ({material}-settings), fallback to legacy ({material}-laser-cleaning)
  let settings = await getSettingsArticle(`${slug}-settings`);
  let settingsSlug = `${slug}-settings`;
  
  if (!settings) {
    // Fallback to legacy naming
    settings = await getSettingsArticle(`${slug}-laser-cleaning`);
    settingsSlug = `${slug}-laser-cleaning`;
  }

  if (!settings) {
    notFound();
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
}
