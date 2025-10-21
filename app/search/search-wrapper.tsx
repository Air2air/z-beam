"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchClient from "./search-client";
import { Layout } from "../components/Layout/Layout";
import { Article, SearchWrapperProps } from "@/types";
import { capitalizeWords } from "../utils/formatting";

export default function SearchWrapper({ initialArticles }: SearchWrapperProps) {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const propertyName = searchParams?.get('property') || '';
  const propertyValue = searchParams?.get('value') || '';
  
  const [resultCount, setResultCount] = useState<number>(0);
  const [propertyUnit, setPropertyUnit] = useState<string>('');
  
  // Build title
  const getTitle = () => {
    return 'Search';
  };
  
  // Build subtitle based on search parameters
  const getSubtitle = () => {
    if (propertyName && propertyValue) {
      const formattedProperty = capitalizeWords(propertyName.replace(/([A-Z])/g, ' $1').trim());
      const unitText = propertyUnit ? ` ${propertyUnit}` : '';
      return `${resultCount} ${resultCount === 1 ? 'material' : 'materials'} found with ${formattedProperty} of ± ${propertyValue}${unitText}:`;
    }
    if (query) {
      return `Search results for "${query}"`;
    }
    return 'Browse all available materials and articles';
  };
  
  // Set initial count based on whether there's a search
  useEffect(() => {
    if (!query && !propertyName) {
      // No search active, show total count
      setResultCount(initialArticles.length);
    }
  }, [query, propertyName, initialArticles.length]);
  
  // Listen for result count updates from SearchClient
  useEffect(() => {
    const handleResultsUpdate = (event: CustomEvent) => {
      if (event.detail?.count !== undefined) {
        setResultCount(event.detail.count);
      }
      if (event.detail?.unit !== undefined) {
        setPropertyUnit(event.detail.unit);
      }
    };
    
    window.addEventListener('searchResultsUpdated', handleResultsUpdate as EventListener);
    return () => {
      window.removeEventListener('searchResultsUpdated', handleResultsUpdate as EventListener);
    };
  }, []);
  
  return (
    <Layout 
      title={getTitle()}
      subtitle={getSubtitle()}
    >
      <SearchClient initialArticles={initialArticles} />
    </Layout>
  );
}
