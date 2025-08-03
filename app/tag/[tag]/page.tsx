// app/tag/[tag]/page.tsx - Simplified for build
import { getArticlesWithTags } from "@/app/utils/articleTagsUtils";
import { enrichArticles } from "../../utils/articleEnrichment";
import { SearchResults } from "@/app/components/SearchResults/SearchResults";
import { PageProps } from "next";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TagPage({ params }: PageProps) {
  // Safely access the tag parameter with type checking
  const tag = params?.tag ? 
    (typeof params.tag === 'string' ? 
      decodeURIComponent(params.tag) : 
      decodeURIComponent(params.tag[0])
    ) : '';
  
  // Get all articles with tags
  const articles = await getArticlesWithTags();
  
  // Enrich articles with tags and href
  const enrichedArticles = enrichArticles(articles);
  
  // Find matching articles
  const matchingArticles = enrichedArticles.filter(article => 
    article.tags && article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Articles tagged with "{tag}"</h1>
      
      <SearchResults 
        items={matchingArticles} 
        initialTag={tag}
        showTagFilter={true}
      />
      
      {/* Development debug panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm">
          <h3 className="font-bold mb-2">Debug Info</h3>
          <p>Tag: {tag}</p>
          <p>Matching articles: {matchingArticles.length}</p>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: any }) {
  const tagValue = params?.tag ? 
    (typeof params.tag === 'string' ? 
      decodeURIComponent(params.tag) : 
      decodeURIComponent(params.tag[0])
    ) : '';
    
  return {
    title: `Articles tagged with "${tagValue}"`,
    description: `Browse content related to ${tagValue}`
  };
}
