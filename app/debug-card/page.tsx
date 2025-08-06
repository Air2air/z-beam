// app/debug-card/page.tsx
import { Card } from "@/app/components/Card/Card";
import { getArticle } from "@/app/utils/contentIntegrator";
import Image from "next/image";

export default async function DebugCard() {
  const slug = "borosilicate-glass-laser-cleaning";
  const article = await getArticle(slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  // Get frontmatter
  const frontmatter = article.metadata;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Card with Borosilicate Data</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Article Metadata</h2>
        <pre className="whitespace-pre-wrap bg-white p-4 rounded border overflow-auto max-h-96">
          {JSON.stringify(frontmatter, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Direct Image Test</h2>
        <div className="relative h-64 border">
          <Image 
            src="/images/borosilicate-glass-laser-cleaning-hero.jpg"
            alt="Direct image test"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized={true}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Card Component Test</h2>
        <div style={{ width: '300px', height: '300px' }}>
          <Card 
            href="/materials/borosilicate-glass"
            title={frontmatter.title || "Borosilicate Glass"}
            name={frontmatter.name || "Borosilicate Glass"}
            description={frontmatter.description}
            metadata={frontmatter}
          />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Card with Direct Image URL</h2>
        <div style={{ width: '300px', height: '300px' }}>
          <Card 
            href="/materials/borosilicate-glass"
            title="Borosilicate Glass"
            description={frontmatter.description}
            image="/images/borosilicate-glass-laser-cleaning-hero.jpg"
            imageAlt="Borosilicate Glass"
          />
        </div>
      </div>
    </div>
  );
}
