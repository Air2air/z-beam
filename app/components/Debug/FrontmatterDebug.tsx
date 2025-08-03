"use client";

import { useState } from 'react';

interface FrontmatterDebugProps {
  items: any[];
}

export function FrontmatterDebug({ items }: FrontmatterDebugProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Frontmatter Debug</h3>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {expanded && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Items ({items.length}):</h4>
          {items.slice(0, 5).map((item, index) => (
            <div key={index} className="mb-6 bg-white p-3 rounded shadow-sm">
              <h5 className="font-bold border-b pb-1 mb-2">
                Item {index + 1}: {item.slug || 'Unknown'}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-semibold text-blue-600">Name/Title Fields:</h6>
                  <ul className="list-disc pl-5 text-xs mt-1">
                    <li><span className="font-mono">name:</span> {JSON.stringify(item.name)}</li>
                    <li><span className="font-mono">title:</span> {JSON.stringify(item.title)}</li>
                    <li><span className="font-mono">frontmatter?.name:</span> {JSON.stringify(item.frontmatter?.name)}</li>
                    <li><span className="font-mono">frontmatter?.title:</span> {JSON.stringify(item.frontmatter?.title)}</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-semibold text-green-600">Frontmatter Structure:</h6>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(item.frontmatter, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="font-semibold text-purple-600">Article Structure:</h6>
                <ul className="list-disc pl-5 text-xs mt-1">
                  <li><span className="font-mono">slug:</span> {JSON.stringify(item.slug)}</li>
                  <li><span className="font-mono">href:</span> {JSON.stringify(item.href)}</li>
                  <li><span className="font-mono">tags:</span> {JSON.stringify(item.tags)}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
