// app/materials/[category]/page.tsx
// Dynamic category pages with SEO optimization

import { notFound } from 'next/navigation';
import { CardGridSSR } from '@/app/components/CardGrid';
import { Layout } from '@/app/components/Layout/Layout';
import { getAllArticleSlugs } from '@/app/utils/contentAPI';
import { createMetadata } from '@/app/utils/metadata';
import { CATEGORY_METADATA, VALID_CATEGORIES } from '../metadata';
import { CONTAINER_STYLES } from '@/app/utils/containerStyles';

// Static generation for all category pages
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

// SEO metadata generation per category
export async function generateMetadata({ params }: { params: { category: string } }) {
  const { category } = params;
  
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      title: 'Category Not Found | Z-Beam',
      description: 'The requested material category was not found.',
    };
  }

  const categoryMetadata = CATEGORY_METADATA[category];
  
  return createMetadata({
    title: categoryMetadata.title,
    description: categoryMetadata.description,
    keywords: categoryMetadata.keywords,
    image: categoryMetadata.ogImage,
    slug: `materials/${category}`,
  });
}

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = params;
  
  // Validate category exists
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // Get metadata for this category
  const categoryMetadata = CATEGORY_METADATA[category];
  
  // Fetch all article slugs
  const slugs = await getAllArticleSlugs();
  
  // Capitalize category name for display
  const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Layout>
      {/* Category Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className={CONTAINER_STYLES.standard}>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {categoryDisplayName} Laser Cleaning
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6">
              {categoryMetadata.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryMetadata.keywords.slice(0, 5).map((keyword) => (
                <span 
                  key={keyword}
                  className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className={CONTAINER_STYLES.standard}>
        <CardGridSSR
          slugs={slugs}
          title={`${categoryDisplayName} Materials`}
          columns={3}
          mode="simple"
          filterBy={categoryDisplayName}
          showBadgeSymbols={true}
          loadBadgeSymbolData={true}
          className="mt-8"
        />
      </section>

      {/* Category Information */}
      <section className={`${CONTAINER_STYLES.standard} mt-16`}>
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            About {categoryDisplayName} Laser Cleaning
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {getCategoryDescription(category)}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Helper function for detailed category descriptions
function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    metal: "Metal laser cleaning represents the most widely adopted application of laser surface treatment technology. Our systems excel at removing oxidation, corrosion, paint, and contaminants from aluminum, steel, titanium, and precious metals without damaging the underlying substrate. This non-contact, environmentally friendly process is essential for aerospace component refurbishment, automotive restoration, and precision manufacturing.",
    
    ceramic: "Ceramic materials demand the highest precision in laser cleaning due to their brittleness and thermal sensitivity. Our specialized parameters ensure safe removal of contaminants from alumina, silicon nitride, and technical ceramics used in semiconductor manufacturing, aerospace components, and industrial applications. The process maintains the integrity of these critical materials while achieving superior cleanliness standards.",
    
    composite: "Composite materials present unique challenges requiring carefully controlled laser parameters to avoid delamination or matrix damage. Our expertise covers carbon fiber reinforced polymers (CFRP), glass fiber reinforced plastics (GFRP), and advanced composite structures used in aerospace, automotive, and marine applications. The selective removal process preserves fiber integrity while eliminating surface contaminants.",
    
    semiconductor: "Semiconductor cleaning demands the ultimate in precision and contamination control. Our ultra-clean laser systems safely process silicon wafers, gallium arsenide substrates, and other semiconductor materials without introducing particles or chemical residues. This critical process enables advanced microelectronics manufacturing and photovoltaic applications.",
    
    glass: "Glass laser cleaning requires precise energy control to avoid thermal stress and cracking. Our systems safely clean optical glass, laboratory glassware, architectural glass, and technical glass components. The process removes organic contaminants, oxidation, and deposits while maintaining optical clarity and surface quality.",
    
    stone: "Natural stone restoration combines traditional conservation principles with modern laser technology. Our heritage-approved methods safely clean granite, marble, limestone, and other architectural stones without causing surface damage or chemical alteration. This approach is essential for monument conservation, building restoration, and artistic preservation.",
    
    wood: "Wood laser cleaning offers a revolutionary approach to furniture restoration and heritage conservation. Our gentle parameters safely remove finishes, stains, and contaminants from hardwoods and softwoods without mechanical abrasion or chemical solvents. This process reveals original wood surfaces while preserving historical authenticity.",
    
    masonry: "Masonry restoration using laser technology provides unparalleled control over cleaning depth and selectivity. Our systems effectively remove pollution, biological growth, and protective coatings from brick, cement, and stone structures while preserving original surface textures. This method is ideal for architectural conservation and building maintenance.",
    
    plastic: "Plastic and polymer cleaning requires careful parameter optimization to avoid thermal damage or surface modification. Our systems safely process thermoplastics, engineering polymers, and composite materials used in automotive, electronics, and consumer applications. The process removes contaminants while maintaining material properties and surface finish."
  };
  
  return descriptions[category] || "";
}