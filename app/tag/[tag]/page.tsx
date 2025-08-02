// app/tag/[tag]/page.tsx - With frontmatter search
import { Metadata } from "next";
import { Card } from "../../components/Card/Card";
import { TagFilter } from "../../components/UI/TagFilter";
import { getAllArticles, getAllTags, Article } from "../../utils/contentUtils";

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  // Await the params object before using its properties
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
  
  console.log("Looking for tag:", tag);
  
  try {
    // Add error handling
    const [articles, allTags] = await Promise.all([
      getAllArticles(),
      getAllTags()
    ]);
    
    console.log("Total articles found:", articles.length);
    console.log("Available tags:", allTags);
    
    if (articles.length === 0) {
      console.error("No articles returned from getAllArticles()");
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">No Articles Available</h1>
          <p>The content system is not returning any articles. Please check your implementation.</p>
        </div>
      );
    }
    
    // Simple filtering for debugging
    const filteredArticles = articles.filter(article => {
      if (!article.tags) return false;
      
      // Log each article's tags for debugging
      console.log(`Article "${article.title}" has tags: ${article.tags.join(', ')}`);
      
      // Case insensitive search
      return article.tags.some(articleTag => 
        articleTag.toLowerCase() === tag.toLowerCase()
      );
    });
    
    console.log("Filtered articles:", filteredArticles.map(a => a.title));
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Articles tagged with "{tag}"</h1>
        <p>Debug info: Found {filteredArticles.length} of {articles.length} total articles</p>
        
        {/* Tag navigation */}
        <div className="mb-8">
          <TagFilter
            tags={allTags}
            selectedTag={tag}
            linkPrefix="/tag/"
            className="flex flex-wrap gap-2"
          />
        </div>
        
        {/* Articles grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.slug}
                href={`/${article.slug}`}
                title={article.title}
                description={article.description || ""}
                image={article.image}
                imageAlt={article.imageAlt || article.title}
                tags={article.tags || []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found with this tag.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in TagPage:", error);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error Loading Articles</h1>
        <p>An error occurred while loading article data.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}