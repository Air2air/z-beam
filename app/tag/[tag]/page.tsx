// app/tag/[tag]/page.tsx
import { Metadata } from "next";
import { getAllArticles } from "../../utils/contentUtils";
import { SearchResults } from "@/app/components/SearchResults/SearchResults";
import { Article, EnrichedArticle } from "../../types/Article";
import { enrichArticles } from "../../utils/articleEnrichment";
import { getArticlesWithTags } from "@/app/utils/articleTagsUtils";

interface TagPageProps {
  params: Promise<{ tag: string }> | { tag: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  
  return {
    title: `Articles tagged with "${tag}"`,
    description: `Browse all content related to ${tag}`
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  
  try {
    // Get all articles with tags loaded from the tags directory
    const articles = await getArticlesWithTags() as Article[];
    
    // Enrich articles with tags and href
    const enrichedArticles = enrichArticles(articles) as EnrichedArticle[];
    
    console.log("Tag page debugging:");
    console.log(`Looking for tag: ${tag}`);
    
    // Find articles that match the tag (case insensitive)
    const matchingArticles = enrichedArticles.filter(article => 
      article.tags && article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
    
    console.log(`Articles with tag "${tag}": ${matchingArticles.length}`);
    
    // Log all tags to help debug
    console.log("All tags in articles:", 
      [...new Set(enrichedArticles.flatMap(a => a.tags || []))]
    );
    
    if (articles.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">No Articles Available</h1>
          <p>The content system is not returning any articles.</p>
        </div>
      );
    }
    
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
            <h3 className="font-bold mb-2">Debug Info for Tag: {tag}</h3>
            <p>Total articles: {articles.length}</p>
            <p>Articles with tag "{tag}": {matchingArticles.length}</p>
            
            {matchingArticles.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Matching Articles:</h4>
                <ul className="list-disc pl-5 mt-1">
                  {matchingArticles.slice(0, 5).map((article, index) => (
                    <li key={index}>
                      {article.title || article.frontmatter?.title || 'Unnamed'} 
                      <span className="text-xs text-gray-500">
                        {article.tags.length ? ` (Tags: ${article.tags.join(', ')})` : ' (No tags)'}
                      </span>
                    </li>
                  ))}
                </ul>
                {matchingArticles.length > 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ...and {matchingArticles.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading articles:", error);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error Loading Articles</h1>
        <p>An error occurred while loading article data.</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-3 bg-red-50 text-red-700 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
      </div>
    );
  }
}