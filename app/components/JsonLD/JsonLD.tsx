// app/components/JsonLD/JsonLD.tsx
import React from 'react';

interface JsonLDProps {
  content: any;
  config?: {
    isVisible?: boolean;
    className?: string;
  };
}

export function JsonLD({ content, config = { isVisible: false } }: JsonLDProps) {
  // If content is a string, try to parse it as JSON
  const jsonData = typeof content === 'string' 
    ? JSON.parse(content) 
    : content;
  
  // Return the JSON-LD script tag
  return (
    <>
      {/* Add the actual JSON-LD script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonData) }}
      />
      
      {/* Optional visible representation for debugging */}
      {config.isVisible && (
        <div className={`json-ld-debug ${config.className || ''}`}>
          <details>
            <summary className="text-sm font-mono cursor-pointer p-2 bg-gray-100 dark:bg-gray-800 rounded">
              Show JSON-LD Schema
            </summary>
            <pre className="text-xs p-4 overflow-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-b">
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </>
  );
}