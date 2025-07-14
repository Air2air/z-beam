// app/components/ContentList.tsx

import Link from "next/link";
import { formatDate } from "app/utils/utils";
import { getArticleList } from "app/utils/server";
import { CardItem } from "app/components/CardItem";
import { FadeInOnScroll } from "app/components/FadeInOnScroll";
import type { ArticlePost } from 'app/types';

interface ContentListProps {
  category?: string;
  limit?: number;
  excludeSlug?: string;
  authorId?: number;
  tag?: string;
  sortBy?: 'date' | 'name' | 'atomicNumber';
}

// Unified component that can display any content type
export async function ContentList({ 
  category,
  limit,
  excludeSlug,
  authorId,
  tag,
  sortBy = 'name'
}: ContentListProps) {
  // Get all articles
  let articles: ArticlePost[] = getArticleList();

  // Filter by category if provided
  if (category) {
    articles = articles.filter(article => 
      article.metadata.articleType === category
    );
  }

  // Filter by author ID if provided
  if (authorId !== undefined) {
    articles = articles.filter(article => 
      article.metadata.authorId === authorId
    );
  }

  // Filter by tag if provided
  if (tag) {
    articles = articles.filter(article => 
      article.metadata.tags?.includes(tag)
    );
  }

  // Exclude a specific article by slug if needed
  if (excludeSlug) {
    articles = articles.filter(article => 
      article.slug !== excludeSlug
    );
  }

  // Sort the articles
  articles = articles.sort((a, b) => {
    if (sortBy === 'date' && a.metadata.publishedAt && b.metadata.publishedAt) {
      return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
    } else if (sortBy === 'atomicNumber' && a.metadata.atomicNumber && b.metadata.atomicNumber) {
      return a.metadata.atomicNumber - b.metadata.atomicNumber;
    } else {
      // Default sort by name/nameShort
      const nameA = (a.metadata.nameShort || a.metadata.title || "").toLowerCase();
      const nameB = (b.metadata.nameShort || b.metadata.title || "").toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }
  });

  // Apply limit if provided
  if (limit && limit > 0 && limit < articles.length) {
    articles = articles.slice(0, limit);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
      {articles.map((article, index) => (
        <FadeInOnScroll
          key={article.slug}
          delay={0.05 * index}
          yOffset={20}
          amount={0.1}
        >
          <CardItem
            href={`/${article.slug}`}
            imageUrl={article.metadata.thumbnail || "/path/to/default-image.jpg"}
            imageAlt={article.metadata.title}
            title={article.metadata.title}
            description={article.metadata.summary}
            date={article.metadata.publishedAt ? formatDate(article.metadata.publishedAt) : undefined}
            nameShort={article.metadata.nameShort}
            atomicNumber={article.metadata.atomicNumber}
            chemicalSymbol={article.metadata.chemicalSymbol}
            materialType={article.metadata.materialType}
            metalClass={article.metadata.metalClass}
            crystalStructure={article.metadata.crystalStructure}
            primaryApplication={article.metadata.primaryApplication}
          />
        </FadeInOnScroll>
      ))}
    </div>
  );
}

// For backwards compatibility, export aliases that internally use ContentList
export async function MaterialList() {
  return <ContentList category="material" />;
}

export async function ArticleList() {
  return <ContentList />;
}
