"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchClient from "./search-client";
import { Layout } from "../components/Layout/Layout";
import { Article } from "@/types";
import { capitalizeWords } from "../utils/formatting";

interface SearchWrapperProps {
  initialArticles: Article[];
}

export default function SearchWrapper({ initialArticles }: SearchWrapperProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const propertyName = searchParams?.get('property') || '';
  const propertyValue = searchParams?.get('value') || '';
  const propertyUnit = searchParams?.get('unit') || '';
  
  const [resultCount, setResultCount] = useState<number>(initialArticles.length);
  
  // Build subtitle based on search parameters
  const getSubtitle = () => {
    if (propertyName && propertyValue) {
      return `Materials with ${capitalizeWords(propertyName.replace(/([A-Z])/g, ' $1').trim())}: ${propertyValue}${propertyUnit ? ' ' + propertyUnit : ''}`;
    }
    if (query) {
      return `Search results for "${query}"`;
    }
    return 'Browse all available materials and articles';
  };
  
  // Listen for result count updates from SearchClient
  useEffect(() => {
    const handleResultsUpdate = (event: CustomEvent) => {
      if (event.detail?.count !== undefined) {
        setResultCount(event.detail.count);
      }
    };
    
    window.addEventListener('searchResultsUpdated', handleResultsUpdate as EventListener);
    return () => {
      window.removeEventListener('searchResultsUpdated', handleResultsUpdate as EventListener);
    };
  }, []);
  
  return (
    <Layout 
      title="Search"
      subtitle={getSubtitle()}
    >
      {/* Result count display */}
      {(query || propertyName) && (
        <div className="mb-6 text-right">
          <p className="text-gray-400 text-sm whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'result' : 'results'} found
          </p>
        </div>
      )}
      
      <SearchClient initialArticles={initialArticles} />
    </Layout>
  );
}
