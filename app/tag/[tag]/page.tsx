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
  // Await the params object before using its properties
  const resolvedParams = await params;
  const tag = decodeURIComponent(resolvedParams.tag);
  
  // Get data
  const [articles, allTags] = await Promise.all([
    getAllArticles(),
    getAllTags()
  ]);
  
  // Filter articles by tag with improved matching - including frontmatter
  const filteredArticles = articles.filter(article => {
    const normalizedSearchTag = tag.toLowerCase().trim();
    
    // 1. Check tags first (your existing tag matching logic)
    if (article.tags && article.tags.length > 0) {
      // Try exact match first (case insensitive)
      const hasExactMatch = article.tags.some(articleTag => 
        articleTag.toLowerCase() === normalizedSearchTag
      );
      
      if (hasExactMatch) return true;
      
      // Acronym checking
      if (normalizedSearchTag.length <= 3) {
        const hasAcronymMatch = article.tags.some(articleTag => {
          const words = articleTag.split(/\s+/);
          if (words.length > 1) {
            const acronym = words.map(word => word[0]).join('').toLowerCase();
            return acronym === normalizedSearchTag;
          }
          return false;
        });
        
        if (hasAcronymMatch) return true;
      }
      
      // Substring checking for longer tags
      if (normalizedSearchTag.length > 3) {
        const hasSubstringMatch = article.tags.some(articleTag => 
          articleTag.toLowerCase().includes(normalizedSearchTag) ||
          normalizedSearchTag.includes(articleTag.toLowerCase())
        );
        
        if (hasSubstringMatch) return true;
      }
    }
    
    // 2. Check title and description (basic frontmatter)
    if (article.title && article.title.toLowerCase().includes(normalizedSearchTag)) {
      return true;
    }
    
    if (article.description && article.description.toLowerCase().includes(normalizedSearchTag)) {
      return true;
    }
    
    // 3. Check other frontmatter fields if they exist
    if (article.metadata) {
      // Check keywords/subjects
      if (article.metadata.keywords && Array.isArray(article.metadata.keywords)) {
        const keywordMatch = article.metadata.keywords.some(keyword => 
          keyword.toLowerCase().includes(normalizedSearchTag) ||
          normalizedSearchTag.includes(keyword.toLowerCase())
        );
        if (keywordMatch) return true;
      }
      
      // Check category
      if (article.metadata.category && 
          article.metadata.category.toLowerCase().includes(normalizedSearchTag)) {
        return true;
      }
      
      // Check author
      if (article.metadata.author && 
          article.metadata.author.toLowerCase().includes(normalizedSearchTag)) {
        return true;
      }
      
      // Check custom frontmatter fields
      // These will depend on your specific frontmatter structure
      const customFields = ['subject', 'topic', 'material', 'application', 'industry'];
      for (const field of customFields) {
        if (article.metadata[field] && 
            article.metadata[field].toLowerCase().includes(normalizedSearchTag)) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Articles tagged with "{tag}"</h1>
      
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
}