// app/components/AuthorArticles.tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArticleList } from "./ArticleList";
import { FadeInOnScroll } from "./FadeInOnScroll";
import { AuthorCard } from "./AuthorCard";
import { Button } from "./Button";
import type { MaterialPost, AuthorMetadata } from 'app/types';

interface AuthorArticlesProps {
  authorId: number;
  className?: string;
  excludeSlug?: string; // To exclude current article when showing "More by this author"
  limit?: number; // Optional limit for number of articles to show
  authors: AuthorMetadata[];
  allMaterials: MaterialPost[];
}

export function AuthorArticles({ 
  authorId, 
  className = "",
  excludeSlug,
  limit,
  authors,
  allMaterials
}: AuthorArticlesProps) {
  const router = useRouter();
  const author = authors.find(a => a.id === authorId);
  
  if (!author) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">Author not found.</p>
      </div>
    );
  }

  // Filter articles by this author
  let authorArticles = allMaterials.filter(material => 
    material.metadata.authorId === authorId
  );

  // Exclude current article if specified
  if (excludeSlug) {
    authorArticles = authorArticles.filter(material => 
      material.slug !== excludeSlug
    );
  }

  // Apply limit if specified
  if (limit && limit > 0) {
    authorArticles = authorArticles.slice(0, limit);
  }

  const title = excludeSlug 
    ? `More articles by ${author.name}`
    : `Articles by ${author.name}`;
    
  const description = excludeSlug 
    ? `Explore more laser cleaning insights from ${author.title}`
    : `${author.title} - ${authorArticles.length} article${authorArticles.length !== 1 ? 's' : ''}`;

  // Check if we're showing a limited view and there are more articles available
  const totalAuthorArticles = allMaterials.filter(material => 
    material.metadata.authorId === authorId && material.slug !== excludeSlug
  ).length;
  
  const showViewAllLink = limit && totalAuthorArticles > limit;

  return (
    <div className={className}>
      <ArticleList
        articles={authorArticles}
        title={title}
        description={description}
        showAuthor={false}
      />
      
      {/* View All Articles Link */}
      {showViewAllLink && (
        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push(`/authors/${author.slug}${excludeSlug ? `?from=${excludeSlug}` : ''}`)}
            variant="primary"
            size="lg"
          >
            View all articles by {author.name}
            <span className="ml-2">→</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Component to show all authors with their article counts
export function AuthorDirectory({ 
  className = "",
  authors,
  allMaterials 
}: { 
  className?: string;
  authors: AuthorMetadata[];
  allMaterials: MaterialPost[];
}) {
  const authorsWithCounts = authors.map(author => {
    const articleCount = allMaterials.filter(material => 
      material.metadata.authorId === author.id
    ).length;
    
    return {
      ...author,
      articleCount
    };
  }).filter(author => author.articleCount > 0); // Only show authors with articles

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Author</h2>
        <p className="text-gray-600">Discover laser cleaning insights from our expert contributors</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {authorsWithCounts.map((author, index) => (
          <FadeInOnScroll
            key={author.id}
            delay={0.1 * index}
            yOffset={20}
            amount={0.1}
          >
            <AuthorCard 
              author={author} 
              variant="compact" 
              showArticleCount={true} 
              showSpecialties={true} 
              maxSpecialties={3} 
            />
          </FadeInOnScroll>
        ))}
      </div>
    </div>
  );
}
