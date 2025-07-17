// app/components/AuthorSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { ArticleList } from "../List/ArticleList";
import { AuthorDirectory } from "./AuthorArticles";
import { SmartTagList } from "../Tag/SmartTagList";
import type { MaterialPost, AuthorMetadata } from 'app/types';

interface AuthorSearchProps {
  className?: string;
  showDirectory?: boolean;
  authors: AuthorMetadata[];
  allMaterials: MaterialPost[];
}

export function AuthorSearch({ 
  className = "",
  showDirectory = true,
  authors,
  allMaterials
}: AuthorSearchProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<MaterialPost[]>([]);

  // Handle author selection
  const handleAuthorSelect = (authorId: number) => {
    setSelectedAuthorId(authorId);
    
    // Filter materials by selected author
    const authorMaterials = allMaterials.filter(material => 
      material.metadata.authorId === authorId
    );
    setSearchResults(authorMaterials);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedAuthorId(null);
    setSearchResults([]);
  };

  // Listen for custom author filter events (from AuthorCard clicks)
  useEffect(() => {
    const handleAuthorFilter = (event: CustomEvent) => {
      const { authorId } = event.detail;
      handleAuthorSelect(authorId);
      
      // Scroll to results section
      setTimeout(() => {
        const resultsElement = document.getElementById('author-search-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('authorFilter', handleAuthorFilter as EventListener);
    return () => {
      window.removeEventListener('authorFilter', handleAuthorFilter as EventListener);
    };
  }, []);

  const selectedAuthor = selectedAuthorId ? authors.find(a => a.id === selectedAuthorId) : null;

  return (
    <div className={className}>
      {/* Author Selection Dropdown */}
      <div className="mb-8">
        <div className="max-w-md">
          <label htmlFor="author-select" className="block text-sm font-medium text-gray-700 mb-2">
            Filter articles by author
          </label>
          <div className="flex gap-2">
            <select
              id="author-select"
              value={selectedAuthorId || ''}
              onChange={(e) => {
                const authorId = e.target.value ? parseInt(e.target.value, 10) : null;
                if (authorId) {
                  handleAuthorSelect(authorId);
                } else {
                  handleClearSelection();
                }
              }}
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select an author...</option>
              {authors.map((author) => {
                const articleCount = allMaterials.filter(m => m.metadata.authorId === author.id).length;
                return (
                  <option key={author.id} value={author.id}>
                    {author.name} ({articleCount} article{articleCount !== 1 ? 's' : ''})
                  </option>
                );
              })}
            </select>
            {selectedAuthorId && (
              <button
                onClick={handleClearSelection}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div id="author-search-results">
        {selectedAuthor && searchResults.length > 0 && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                {selectedAuthor.image && (
                  <img
                    src={selectedAuthor.image}
                    alt={selectedAuthor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAuthor.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedAuthor.title}</p>
                  <p className="text-sm text-gray-700">{selectedAuthor.bio}</p>
                  {selectedAuthor.specialties && selectedAuthor.specialties.length > 0 && (
                    <div className="mt-2">
                      <SmartTagList 
                        tags={selectedAuthor.specialties}
                        title="Specialties"
                        className=""
                        maxTags={5}
                        showByCategory={false}
                        linkable={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ArticleList
              articles={searchResults}
              title={`Articles by ${selectedAuthor.name}`}
              description={`${searchResults.length} article${searchResults.length !== 1 ? 's' : ''} by ${selectedAuthor.title}`}
            />
          </div>
        )}

        {selectedAuthor && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No articles found for {selectedAuthor.name}.</p>
          </div>
        )}
      </div>

      {/* Author Directory - always show if enabled */}
      {showDirectory && (
        <AuthorDirectory 
          className="mt-8" 
          authors={authors}
          allMaterials={allMaterials}
        />
      )}
    </div>
  );
}
