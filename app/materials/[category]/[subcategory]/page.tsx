// app/materials/[category]/[subcategory]/page.tsx
import { notFound } from "next/navigation";
import { getAllCategories, getSubcategoryInfo } from "@/app/utils/materialCategories";
import { Layout } from "@/app/components/Layout/Layout";
import { SITE_CONFIG } from "@/app/config";
import { JsonLD } from "@/app/components/JsonLD/JsonLD";
import { SchemaFactory } from "@/app/utils/schemas/SchemaFactory";
import { CardGridSSR } from "@/app/components/CardGrid";
import { createMetadata } from "@/app/utils/metadata";
import { CONTAINER_STYLES } from "@/app/utils/containerStyles";

export const dynamic = 'force-static';
export const revalidate = false;

interface PageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

// Generate static params for all subcategories
export async function generateStaticParams() {
  const categories = await getAllCategories();
  const params: { category: string; subcategory: string }[] = [];
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      params.push({
        category: category.slug,
        subcategory: subcategory.slug
      });
    }
  }
  
  return params;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfo(category, subcategory);
  
  if (!subcategoryInfo) {
    return {
      title: `Subcategory Not Found | ${SITE_CONFIG.shortName}`,
      description: 'The requested subcategory could not be found.'
    };
  }
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  
  return createMetadata({
    title: `${subcategoryInfo.label} ${categoryLabel} Laser Cleaning`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials. ${subcategoryInfo.materials.length} materials available.`,
    keywords: [
      `${subcategoryInfo.label} laser cleaning`,
      `${categoryLabel} cleaning`,
      `${subcategoryInfo.label} ${categoryLabel}`,
      'laser surface treatment'
    ],
    slug: `materials/${category}/${subcategory}`
  });
}

export default async function SubcategoryPage({ params }: PageProps) {
  const { category, subcategory } = await params;
  const subcategoryInfo = await getSubcategoryInfo(category, subcategory);
  
  if (!subcategoryInfo) {
    notFound();
  }
  
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Generate JSON-LD
  const schemaData = {
    title: `${subcategoryInfo.label} ${categoryLabel} Laser Cleaning`,
    description: `Laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials`,
    category: category,
    subcategory: subcategory,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: categoryLabel, href: `/materials/${category}` },
      { label: subcategoryInfo.label, href: `/materials/${category}/${subcategory}` }
    ]
  };
  
  const factory = new SchemaFactory(schemaData, `materials/${category}/${subcategory}`);
  const jsonLdData = factory.generate();
  
  // Get material slugs for this subcategory
  const materialSlugs = subcategoryInfo.materials.map(m => m.slug);
  
  return (
    <>
      <JsonLD data={jsonLdData} />
      <Layout
        title={`${subcategoryInfo.label} ${categoryLabel}`}
        subtitle={`${subcategoryInfo.materials.length} materials available for laser cleaning`}
        description={`Explore laser cleaning solutions for ${subcategoryInfo.label.toLowerCase()} ${categoryLabel.toLowerCase()} materials`}
        metadata={schemaData as any}
        slug={`materials/${category}/${subcategory}`}
        fullWidth
      >
        {/* Materials Grid */}
        <section className={CONTAINER_STYLES.standard}>
          <CardGridSSR
            slugs={materialSlugs}
            columns={3}
            mode="simple"
            showBadgeSymbols={true}
            loadBadgeSymbolData={true}
          />
        </section>
      </Layout>
    </>
  );
}
