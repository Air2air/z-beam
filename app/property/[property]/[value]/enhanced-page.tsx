// app/property/[property]/[value]/enhanced-page.tsx
import { searchByPropertyValue } from "../../../utils/propertySearch";
import { enrichArticles } from "../../../utils/articleEnrichment";
import { ArticleGridClient } from "../../../components/ArticleGrid/ArticleGridClient";
import { PageProps } from "../../../../types/core";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function EnhancedPropertySearchPage({ params }: PageProps) {
  // Await params before using it
  const paramsData = await params;
  
  // Safely access the parameters with proper type handling
  const propertyParam = paramsData?.property;
  const valueParam = paramsData?.value;
  const property = propertyParam ? (Array.isArray(propertyParam) ? decodeURIComponent(propertyParam[0]) : decodeURIComponent(propertyParam)) : '';
  const value = valueParam ? (Array.isArray(valueParam) ? decodeURIComponent(valueParam[0]) : decodeURIComponent(valueParam)) : '';
  
  // Get basic results
  const basicArticles = await searchByPropertyValue(property, value);
  
  // Enrich articles with tags and href
  const enrichedArticles = enrichArticles(basicArticles);
  
  // Determine search type message
  const getSearchTypeMessage = () => {
    return 'exact matches';
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          Materials with {property}: &quot;{value}&quot;
        </h1>
        <p className="text-gray-600 mb-4">
          Found {enrichedArticles.length} {getSearchTypeMessage()}
        </p>
        
        {/* Search Type Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            🎯 Exact Match
          </span>
        </div>
      </div>
      
      {/* No Results Message */}
      {enrichedArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No materials found</h3>
          <p className="text-gray-500 mb-4">
            No materials have {property.toLowerCase()} &quot;{value}&quot;
          </p>
          <Link
            href="/property"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse all properties
          </Link>
        </div>
      )}
      
      {/* Results */}
      {enrichedArticles.length > 0 && (
        <ArticleGridClient 
          items={enrichedArticles.map((article) => ({
            slug: article.slug || 'unknown',
            title: article.metadata?.subject || article.title || 'Untitled Article',
            description: article.description || article.excerpt || '',
            href: `/${article.slug}`,
            imageUrl: article.image,
            imageAlt: article.imageAlt || article.title || '',
            badge: {
              symbol: article.metadata?.chemicalSymbol,
              formula: article.metadata?.chemicalFormula,
              atomicNumber: article.metadata?.atomicNumber,
              materialType: article.metadata?.category as any,
            },
            metadata: article.metadata,
          }))}
          columns={3}
          variant="search"
        />
      )}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  // Ensure params is awaited before accessing properties
  const paramsData = await params;
  
  const propertyParam = paramsData?.property;
  const valueParam = paramsData?.value;
  const property = propertyParam ? (Array.isArray(propertyParam) ? decodeURIComponent(propertyParam[0]) : decodeURIComponent(propertyParam)) : '';
  const value = valueParam ? (Array.isArray(valueParam) ? decodeURIComponent(valueParam[0]) : decodeURIComponent(valueParam)) : '';
    
  return {
    title: `Materials with ${property}: "${value}"`,
    description: `Browse materials that have ${property} set to ${value}, including similar ranges and fuzzy matches`
  };
}
