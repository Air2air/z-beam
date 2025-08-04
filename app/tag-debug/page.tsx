'use client';

import { useEffect, useState } from 'react';

export default function TagDebugPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.statusText}`);
        }
        const data = await response.json();
        setTags(data.tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTags();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tag Debug Page</h1>
      
      {loading && <div>Loading tags...</div>}
      
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <>
          <p className="mb-4">Total tags: {tags.length}</p>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Author Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter(tag => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(tag)) // Simple pattern to match potential author names
                .map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {tag}
                  </span>
                ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">All Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
