// Test file to demonstrate Card variants
// This is a temporary file for testing - can be deleted after verification

import React from 'react';
import { Card } from './app/components/Card/Card';
import { ArticleMetadata } from './types/centralized';

const sampleFrontmatter: ArticleMetadata = {
  title: "Sample Material",
  subject: "Sample Material",
  description: "A sample material for testing card variants",
  slug: "sample-material",
  images: {
    hero: {
      alt: "Sample material image"
    }
  }
};

// Test both variants
export function CardVariantTest() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Card Variants Test</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Standard Card</h2>
          <Card
            frontmatter={sampleFrontmatter}
            href="/test-standard"
            variant="standard"
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Featured Card</h2>
          <Card
            frontmatter={sampleFrontmatter}
            href="/test-featured"
            variant="featured"
          />
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold">Expected Differences:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Featured cards should be taller with larger images (h-48 vs h-20)</li>
          <li>Featured cards should have larger titles (text-xl vs text-base)</li>
          <li>Featured cards should have stronger shadows (shadow-lg vs shadow-md)</li>
          <li>Featured cards should have more padding (p-3 vs p-2)</li>
          <li>Featured cards should show more description lines (line-clamp-3 vs line-clamp-2)</li>
        </ul>
      </div>
    </div>
  );
}

export default CardVariantTest;