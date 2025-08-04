'use client';

import { useEffect, useState } from 'react';

interface Article {
  slug: string;
  title?: string;
  name?: string;
  author?: {
    author_id?: number;
    author_name?: string;
    author_country?: string;
  };
  tags?: string[];
}

export default function TagDiagnosticsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch articles
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
        const data = await response.json();
        
        setArticles(data.articles);
        
        // Extract unique authors
        const authorSet = new Set<string>();
        data.articles.forEach((article: Article) => {
          if (article.author?.author_name) {
            authorSet.add(article.author.author_name);
          }
        });
        
        setAuthors(Array.from(authorSet));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Count articles by author
  const authorCounts: Record<string, number> = {};
  authors.forEach(author => {
    authorCounts[author] = articles.filter(
      article => article.author?.author_name === author
    ).length;
  });

  // Count articles with author tags
  const articlesWithAuthorTags = articles.filter(
    article => article.author?.author_name && 
               article.tags?.includes(article.author.author_name)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tag Diagnostics</h1>
      
      {loading ? (
        <div>Loading data...</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Total articles: {articles.length}</li>
              <li>Unique authors: {authors.length}</li>
              <li>Articles with author tags: {articlesWithAuthorTags.length}</li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Authors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authors.map(author => (
                <div key={author} className="p-4 border rounded shadow">
                  <h3 className="text-lg font-semibold">{author}</h3>
                  <p>Articles: {authorCounts[author]}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Articles with Author Tags</h2>
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Author</th>
                  <th className="border px-4 py-2">Tags</th>
                </tr>
              </thead>
              <tbody>
                {articlesWithAuthorTags.slice(0, 10).map(article => (
                  <tr key={article.slug}>
                    <td className="border px-4 py-2">{article.title || article.name || article.slug}</td>
                    <td className="border px-4 py-2">{article.author?.author_name}</td>
                    <td className="border px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {article.tags?.map(tag => (
                          <span 
                            key={tag} 
                            className={`px-2 py-1 text-xs rounded ${
                              tag === article.author?.author_name 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {articlesWithAuthorTags.length > 10 && (
              <p className="mt-2 text-gray-500">Showing 10 of {articlesWithAuthorTags.length} articles</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
