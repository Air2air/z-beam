// app/components/JSONLD/JSONLD.tsx
import React from 'react';

interface JSONLDProps {
  content: any;
}

export function JSONLD({ content }: JSONLDProps) {
  if (!content) return null;
  
  // Safely stringify JSON
  const jsonString = typeof content === 'string' 
    ? content 
    : JSON.stringify(content, null, 0);
  
  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}