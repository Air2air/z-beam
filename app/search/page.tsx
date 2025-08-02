// app/search/page.tsx - Simplified search page
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "../components/Card/Card";
import { TagFilter } from "../components/UI/TagFilter";
import { getAllArticles, getAllTags, Article } from "../utils/contentUtils";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch all data once
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [articlesData, tagsData] = await Promise.all([
          getAllArticles(),
          getAllTags()
        ]);
        
        setArticles(articlesData);
        setTags(tagsData);
        setError(null);
      } catch (err) {
        setError("Failed to load content. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filter articles based on search query
  const filteredArticles = articles.filter(article => {
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      article.title?.toLowerCase().includes(searchTerm) ||
      article.description?.toLowerCase().includes(searchTerm) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  });
  
  // Loading and error states
  if (isLoading) {
    return <div className="text-center p-8">Loading content...</div>;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {query ? `Search Results for "${query}"` : "All Articles"}
      </h1>
      
      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="mb-8">
          <TagFilter
            tags={tags}
            selectedTag=""
            linkPrefix="/tag/"
            className="flex flex-wrap gap-2"
          />
        </div>
      )}
      
      {/* Results */}
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
          <p className="text-gray-500">
            No results found{query ? ` for "${query}"` : ''}.
          </p>
        </div>
      )}
    </div>
  );
}