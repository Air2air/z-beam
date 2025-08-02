// app/tag/[tag]/page.tsx - Clean version without test data
import { Metadata } from "next";
import { Card } from "../../components/Card/Card";
import { TagFilter } from "../../components/UI/TagFilter";
import { getAllArticles, getAllTags, Article } from "../../utils/contentUtils";

// Helper function to check if tags match with fuzzy logic
function fuzzyTagMatch(searchTag: string, articleTag: string): boolean {
  const searchNormalized = searchTag.toLowerCase().trim();
  const tagNormalized = articleTag.toLowerCase().trim();
  
  // Direct match
  if (searchNormalized === tagNormalized) return true;
  
  // Split search tag into words and check if any words match
  const searchWords = searchNormalized.split(/\s+/);
  const tagWords = tagNormalized.split(/\s+/);
  
  // Check for word-level overlap
  for (const searchWord of searchWords) {
    if (searchWord.length < 3) continue; // Skip short words
    for (const tagWord of tagWords) {
      if (tagWord.includes(searchWord) || searchWord.includes(tagWord)) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to find similar tags when no exact matches are found
function findSimilarTags(searchTag: string, allTags: string[]): string[] {
  const searchNormalized = searchTag.toLowerCase().trim();
  
  return allTags.filter(tag => {
    if (tag.toLowerCase() === searchNormalized) return false; // Skip exact match
    
    // Check for partial matches
    const tagNormalized = tag.toLowerCase().trim();
    const searchWords = searchNormalized.split(/\s+/);
    
    for (const word of searchWords) {
      if (word.length < 3) continue; // Skip short words
      if (tagNormalized.includes(word)) return true;
    }
    
    return false;
  });
}

interface TagPageProps {
  params: { tag: string };
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
    const [articles, allTags] = await Promise.all([
      getAllArticles(),
      getAllTags()
    ]);
    
    if (articles.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">No Articles Available</h1>
          <p>The content system is not returning any articles.</p>
        </div>
      );
    }
    
    // Enhanced filtering using comprehensive frontmatter search
    const filteredArticles = articles.filter(article => {
      const normalizedSearchTag = tag.toLowerCase().trim();
      
      // 1. Check direct tag matches first (most relevant)
      if (article.tags) {
        // Check for exact match first
        const hasExactMatch = article.tags.some(articleTag => 
          articleTag.toLowerCase() === normalizedSearchTag
        );
        
        if (hasExactMatch) return true;
        
        // If no exact match, try fuzzy matching
        const hasFuzzyMatch = article.tags.some(articleTag => 
          fuzzyTagMatch(normalizedSearchTag, articleTag)
        );
        
        if (hasFuzzyMatch) return true;
      }
      
      // 2. Check metadata if available (frontmatter fields)
      if (article.metadata) {
        // Check basic metadata fields
        if (article.metadata.subject && 
            article.metadata.subject.toLowerCase().includes(normalizedSearchTag)) {
          return true;
        }
        
        if (article.metadata.category && 
            article.metadata.category.toLowerCase().includes(normalizedSearchTag)) {
          return true;
        }
        
        if (article.metadata.articleType && 
            article.metadata.articleType.toLowerCase().includes(normalizedSearchTag)) {
          return true;
        }
        
        // Check keywords array (especially important)
        if (article.metadata.keywords && Array.isArray(article.metadata.keywords)) {
          const keywordMatch = article.metadata.keywords.some(keyword => {
            if (typeof keyword === 'string') {
              return keyword.toLowerCase().includes(normalizedSearchTag) || 
                     normalizedSearchTag.includes(keyword.toLowerCase());
            }
            return false;
          });
          
          if (keywordMatch) return true;
        }
        
        // Check chemical properties
        if (article.metadata.chemicalProperties) {
          const props = article.metadata.chemicalProperties;
          if (props.symbol && props.symbol.toLowerCase().includes(normalizedSearchTag)) return true;
          if (props.formula && props.formula.toLowerCase().includes(normalizedSearchTag)) return true;
          if (props.materialType && props.materialType.toLowerCase().includes(normalizedSearchTag)) return true;
        }
        
        // Check applications
        if (article.metadata.applications && Array.isArray(article.metadata.applications)) {
          const applicationMatch = article.metadata.applications.some(app => {
            if (typeof app === 'object') {
              return (
                (app.name && app.name.toLowerCase().includes(normalizedSearchTag)) ||
                (app.description && app.description.toLowerCase().includes(normalizedSearchTag))
              );
            }
            return false;
          });
          
          if (applicationMatch) return true;
        }
        
        // Check composition
        if (article.metadata.composition && Array.isArray(article.metadata.composition)) {
          const compositionMatch = article.metadata.composition.some(comp => {
            if (typeof comp === 'object') {
              return (
                (comp.component && comp.component.toLowerCase().includes(normalizedSearchTag)) ||
                (comp.type && comp.type.toLowerCase().includes(normalizedSearchTag)) ||
                (comp.formula && comp.formula.toLowerCase().includes(normalizedSearchTag))
              );
            }
            return false;
          });
          
          if (compositionMatch) return true;
        }
        
        // Check compatibility
        if (article.metadata.compatibility && Array.isArray(article.metadata.compatibility)) {
          const compatibilityMatch = article.metadata.compatibility.some(compat => {
            if (typeof compat === 'object') {
              return (
                (compat.material && compat.material.toLowerCase().includes(normalizedSearchTag)) ||
                (compat.application && compat.application.toLowerCase().includes(normalizedSearchTag))
              );
            }
            return false;
          });
          
          if (compatibilityMatch) return true;
        }
        
        // Check technical specifications
        if (article.metadata.technicalSpecifications) {
          const specs = article.metadata.technicalSpecifications;
          // Loop through all properties of technicalSpecifications
          for (const [key, value] of Object.entries(specs)) {
            if (typeof value === 'string' && value.toLowerCase().includes(normalizedSearchTag)) {
              return true;
            }
          }
        }
        
        // Check countries and manufacturing centers
        if (article.metadata.countries && Array.isArray(article.metadata.countries)) {
          if (article.metadata.countries.some(country => 
            country.toLowerCase().includes(normalizedSearchTag)
          )) {
            return true;
          }
        }
        
        if (article.metadata.manufacturingCenters && Array.isArray(article.metadata.manufacturingCenters)) {
          if (article.metadata.manufacturingCenters.some(center => 
            center.toLowerCase().includes(normalizedSearchTag)
          )) {
            return true;
          }
        }
      }
      
      // 3. Check basic article properties (fallback)
      if (article.title && article.title.toLowerCase().includes(normalizedSearchTag)) {
        return true;
      }
      
      if (article.description && article.description.toLowerCase().includes(normalizedSearchTag)) {
        return true;
      }
      
      // Now that we've updated the Article interface, we can use these directly
      if (article.name && article.name.toLowerCase().includes(normalizedSearchTag)) {
        return true;
      }
      
      if (article.headline && article.headline.toLowerCase().includes(normalizedSearchTag)) {
        return true;
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
        
        {/* Articles grid with similar tags suggestion */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No articles found with the tag "{tag}".</p>
            
            {/* Similar tags suggestion */}
            {(() => {
              const similarTags = findSimilarTags(tag, allTags);
              
              if (similarTags.length > 0) {
                return (
                  <div className="mt-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-3">You might be interested in these related tags:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {similarTags.map(similarTag => (
                        <a
                          key={similarTag}
                          href={`/tag/${encodeURIComponent(similarTag)}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {similarTag}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              
              return null;
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.slug}
                href={`/${article.slug}`}
                title={article.name || article.title} // Use name as priority, fall back to title
                description={article.description || ""}
                image={article.image}
                imageAlt={article.imageAlt || article.title}
                tags={article.tags || []}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Error Loading Articles</h1>
        <p>An error occurred while loading article data.</p>
      </div>
    );
  }
}