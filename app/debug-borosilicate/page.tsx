// app/debug-borosilicate/page.tsx
import { getArticle } from "@/app/utils/contentIntegrator";
import Image from "next/image";

export default async function DebugBorosilicate() {
  const slug = "borosilicate-glass-laser-cleaning";
  const article = await getArticle(slug);

  if (!article) {
    return <div>Article not found</div>;
  }

  // Get frontmatter
  const frontmatter = article.metadata;
  const heroImageUrl = frontmatter?.images?.hero?.url;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Borosilicate Glass Article</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Article Metadata</h2>
        <pre className="whitespace-pre-wrap bg-white p-4 rounded border overflow-auto max-h-96">
          {JSON.stringify(frontmatter, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Hero Image (from frontmatter)</h2>
        {heroImageUrl ? (
          <div>
            <p className="mb-2">Hero URL: {heroImageUrl}</p>
            <div className="relative h-64 border">
              <Image 
                src={heroImageUrl}
                alt="Hero image from frontmatter"
                fill
                style={{ objectFit: 'cover' }}
                unoptimized={true}
              />
            </div>
          </div>
        ) : (
          <p className="text-red-500">No hero image URL found in frontmatter</p>
        )}
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
    </div>
  );
}
