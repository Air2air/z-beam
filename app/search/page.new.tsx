// app/search/page.tsx
import { Suspense } from "react";
import SearchClient from "./search-client";
import { getAllArticles } from "../utils/contentUtils";
import { getAllUniqueTags } from "../utils/tags";

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  try {
    // Fetch data server-side
    const articles = await getAllArticles();
    const tags = await getAllUniqueTags();
    
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        
        <Suspense fallback={<div>Loading search results...</div>}>
          <SearchClient initialArticles={articles} initialTags={tags} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading search page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search</h1>
        <div className="bg-red-100 p-4 rounded text-red-700">
          Failed to load content. Please try again later.
        </div>
      </div>
    );
  }
}
