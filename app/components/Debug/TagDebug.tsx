'use client';

import React, { useState, useEffect } from 'react';
import { Title } from '../Title';

interface TagData {
  totalArticles: number;
  articlesWithAuthor: number;
  articlesWithFrontmatterAuthor: number;
  sampleAuthors: Array<{
    title: string;
    slug: string;
    author: string;
    tags: string[];
  }>;
}

export function TagDebug() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TagData | null>(null);

  useEffect(() => {
    async function fetchTagDebugData() {
      try {
        setLoading(true);
        const response = await fetch('/api/debug?category=tags');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.tags);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('TagDebug component error', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTagDebugData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded border">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading tag data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded border border-red-200">
        <h3 className="text-red-700">Tag Debug Error</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="text-yellow-700">No Tag Data</h3>
        <p className="text-yellow-600 mt-1">No tag debug data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="text-lg mb-3">Tag System Debug</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-2xl text-blue-700">{data.totalArticles}</div>
          <div className="text-sm text-blue-600">Total Articles</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="text-2xl text-green-700">{data.articlesWithAuthor}</div>
          <div className="text-sm text-green-600">Articles with Author</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded">
          <div className="text-2xl text-purple-700">{data.articlesWithFrontmatterAuthor}</div>
          <div className="text-sm text-purple-600">With Frontmatter Author</div>
        </div>
      </div>
      
      <h4 className="text-gray-700 mb-2">Sample Author Data:</h4>
      {data.sampleAuthors && data.sampleAuthors.length > 0 ? (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase tracking-wider">Tags</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.sampleAuthors.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.title}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{item.slug}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {typeof item.author === 'object' 
                      ? ((item.author as any)?.name || JSON.stringify(item.author))
                      : item.author}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {item.tags && item.tags.length > 0 ? 
                        item.tags.map((tag, tagIdx) => (
                          <span key={tagIdx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))
                        : <span className="text-gray-400">No tags</span>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No sample data available</p>
      )}
    </div>
  );
}
