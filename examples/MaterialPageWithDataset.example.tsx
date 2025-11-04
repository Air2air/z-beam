// Example: How to add MaterialDatasetCard to a material page
// File: app/materials/[category]/[subcategory]/[slug]/page.tsx

import MaterialDatasetCard from '@/app/components/Dataset/MaterialDatasetCard';

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { category, subcategory, slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) notFound();
  
  const material = article.metadata as any;
  
  return (
    <Layout>
      {/* Existing content... */}
      
      {/* Add Dataset Card in sidebar or content area */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Download Dataset</h2>
        <MaterialDatasetCard 
          material={{
            name: material.name,
            category: material.category,
            subcategory: material.subcategory,
            slug: slug,
            parameters: material.parameters,
            materialProperties: material.materialProperties,
            applications: material.applications,
            faqs: material.faqs
          }}
          showFullDataset={true}
        />
      </div>
    </Layout>
  );
}
