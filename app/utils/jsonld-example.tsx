import { createJsonLdScript, createBreadcrumbJsonLd } from '../utils/jsonld-schema';

// Example usage in a material page component
export default function MaterialPage({ params }: { params: { slug: string } }) {
  // Example material data (would typically come from your CMS/frontmatter)
  const materialData = {
    title: 'Steel Laser Cleaning',
    description: 'Technical overview of Steel laser cleaning applications and parameters',
    category: 'metal',
    keywords: ['steel', 'steel metal', 'laser ablation', 'laser cleaning', 'non-contact cleaning'],
    author: 'Z-Beam Technical Team',
    lastModified: '2024-09-24T00:00:00Z',
    properties: {
      density: 7.85,
      densityUnit: 'g/cm³',
      thermalConductivity: 50.2,
      thermalConductivityUnit: 'W/m·K'
    },
    applications: ['Automotive', 'Manufacturing', 'Industrial']
  };

  const jsonLd = createJsonLdScript(materialData, params.slug);
  const breadcrumbJsonLd = createBreadcrumbJsonLd(materialData.title, params.slug);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd, null, 2)
        }}
      />
      
      {/* Your page content */}
      <main>
        <h1>{materialData.title}</h1>
        <p>{materialData.description}</p>
        {/* Rest of your content */}
      </main>
    </>
  );
}