// app/tag/[tag]/page.tsx - Simplified for build
import { getArticlesWithTags } from "../../utils/tags";
import { enrichArticles } from "../../utils/articleEnrichment";
import { SearchResults } from "../../components/SearchResults/SearchResults";
import { TagPageProps } from "../../../types";
import { CONTAINER_STYLES } from "../../utils/containerStyles";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TagPage({ params }: TagPageProps) {
  // Await params before using it
  const paramsData = await params;
  
  // Safely access the tag parameter 
  const tag = paramsData?.tag ? decodeURIComponent(paramsData.tag) : '';
  
  // Get all articles with tags
  const articles = await getArticlesWithTags();
  
  // Enrich articles with tags and href
  const enrichedArticles = enrichArticles(articles);
  
  // Find matching articles
  const matchingArticles = enrichedArticles.filter(article => 
    article.tags && article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
  
  return (
    <div className={CONTAINER_STYLES.standard}>
      <h1 className="text-3xl font-bold mb-6">Articles tagged with &quot;{tag}&quot;</h1>
      
      <SearchResults 
        items={matchingArticles} 
        initialTag={tag}
        showTagFilter={false}
      />
    </div>
  );
}

export async function generateMetadata({ params }: TagPageProps) {
  // Ensure params is awaited before accessing properties
  const paramsData = await params;
  
  const tagValue = paramsData?.tag ? 
    (typeof paramsData.tag === 'string' ? 
      decodeURIComponent(paramsData.tag) : 
      decodeURIComponent(paramsData.tag[0])
    ) : '';
    
  return {
    title: `Articles tagged with "${tagValue}"`,
    description: `Browse content related to ${tagValue}`
  };
}
