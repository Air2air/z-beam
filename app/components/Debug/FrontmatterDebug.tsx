'use client';

import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';

interface FrontmatterItem {
  slug: string;
  title: string;
  author: string;
  [key: string]: unknown;
}

export function FrontmatterDebug() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FrontmatterItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FrontmatterItem | null>(null);

  useEffect(() => {
    async function fetchFrontmatterData() {
      try {
        setLoading(true);
        const response = await fetch('/api/debug?category=frontmatter');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const result = await response.json();
        setData(result.frontmatter || []);
        
        // Select the first item by default
        if (result.frontmatter && result.frontmatter.length > 0) {
          setSelectedItem(result.frontmatter[0]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        logger.error('FrontmatterDebug component error', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFrontmatterData();
  }, []);

  const handleItemSelect = (item: FrontmatterItem) => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded border">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Loading frontmatter data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded border border-red-200">
        <h3 className="font-semibold text-red-700">Frontmatter Debug Error</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-semibold text-yellow-700">No Frontmatter Data</h3>
        <p className="text-yellow-600 mt-1">No frontmatter data available.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded border">
      <h3 className="text-lg font-semibold mb-3">Frontmatter Debug</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1">
          <h4 className="font-medium text-gray-700 mb-2">Available Documents</h4>
          <div className="border rounded overflow-hidden">
            <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
              {data.map((item, index) => (
                <li 
                  key={index}
                  className={`px-3 py-2 cursor-pointer ${selectedItem?.slug === item.slug ? 'bg-blue-50' : ''}`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.slug}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="col-span-2">
          <h4 className="font-medium text-gray-700 mb-2">Frontmatter Preview</h4>
          {selectedItem ? (
            <div className="border rounded p-3 bg-gray-50">
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500">TITLE</span>
                <div className="font-medium">{selectedItem.title}</div>
              </div>
              
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500">SLUG</span>
                <div className="font-mono text-sm">{selectedItem.slug}</div>
              </div>
              
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500">AUTHOR</span>
                <div>{selectedItem.author}</div>
              </div>
              
              <div className="mt-4">
                <span className="text-xs font-medium text-gray-500">FULL STRUCTURE</span>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="border rounded p-4 bg-gray-50 text-gray-500 italic">
              Select a document to view its frontmatter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
