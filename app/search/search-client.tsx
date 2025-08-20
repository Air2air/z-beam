"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "../components/Card/Card";
import { TagFilter } from "../components/UI/TagFilter";
import { Article } from "../types/Article";

interface SearchClientProps {
  initialArticles: Article[];
  initialTags: string[];
}

export default function SearchClient({ initialArticles, initialTags }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  
  const [articles] = useState<Article[]>(initialArticles);
  const [tags] = useState<string[]>(initialTags);
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // Filter articles based on search query and selected tag
  const filteredArticles = articles.filter(article => {
    // First, check tag filter
    if (selectedTag && article.tags) {
      if (!article.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())) {
        return false;
      }
    }
    
    // Then check search query
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      (article.title && article.title.toLowerCase().includes(searchTerm)) ||
      (article.description && article.description.toLowerCase().includes(searchTerm))
    );
  });
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Filter by Tag</h2>
        <TagFilter 
          tags={tags} 
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          {query ? `Search Results for "${query}"` : 'All Articles'}
          {selectedTag && ` tagged with "${selectedTag}"`}
        </h2>
        <p className="text-gray-600">{filteredArticles.length} results found</p>
      </div>
      
      {filteredArticles.length === 0 ? (
        <div className="p-6 bg-gray-100 rounded-lg">
          <p className="text-gray-700">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <Card 
              key={article.slug}
              title={article.title || 'Untitled Article'}
              description={article.description || ''}
              href={`/${article.slug}`}
              image={article.image}
              imageAlt={article.imageAlt || article.title || ''}
              tags={article.tags || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
