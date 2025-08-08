"use client";

import { Thumbnail } from '../components/Thumbnail/Thumbnail';

export default function CategoryFallbackTest() {
  // Test materials with various categories
  const materials = [
    { name: "Test Metal", category: "metal" },
    { name: "Test Ceramic", category: "ceramic" },
    { name: "Test Glass", category: "glass" },
    { name: "Test Composite", category: "composite" },
    { name: "Test Stone", category: "stone" },
    { name: "Test Wood", category: "wood" },
  ];

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Category Fallback Test</h1>
      <p className="mb-6">
        This page tests the thumbnail fallback system for various categories.
        Each category should show an appropriate fallback image.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div key={material.name} className="space-y-2 border border-gray-200 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{material.name}</h2>
            <p className="text-sm text-gray-600">Category: {material.category}</p>
            <div className="w-full h-48 border border-gray-300">
              <Thumbnail 
                alt={material.name}
                frontmatter={{ 
                  category: material.category,
                  articleType: 'material'
                }}
              />
            </div>
          </div>
        ))}
        
        {/* Test with direct src */}
        <div className="space-y-2 border border-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Direct Src Test</h2>
          <p className="text-sm text-gray-600">Using direct src prop</p>
          <div className="w-full h-48 border border-gray-300">
            <Thumbnail 
              alt="Direct Src Test"
              src="/images/ceramic-laser-cleaning-hero.jpg"
            />
          </div>
        </div>
        
        {/* Test with frontmatter.images.hero.url */}
        <div className="space-y-2 border border-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Frontmatter Images Test</h2>
          <p className="text-sm text-gray-600">Using frontmatter.images.hero.url</p>
          <div className="w-full h-48 border border-gray-300">
            <Thumbnail 
              alt="Frontmatter Images Test"
              frontmatter={{ 
                images: {
                  hero: {
                    url: "/images/gold-laser-cleaning-hero.jpg"
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Test with no valid fallback */}
        <div className="space-y-2 border border-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Default Fallback Test</h2>
          <p className="text-sm text-gray-600">No category or valid src</p>
          <div className="w-full h-48 border border-gray-300">
            <Thumbnail 
              alt="Default Fallback Test"
              frontmatter={{ 
                articleType: 'test'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
