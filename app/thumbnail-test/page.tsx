"use client";

import { Thumbnail } from '../components/Thumbnail/Thumbnail';

export default function ThumbnailTest() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Thumbnail Test</h1>
      <p className="mb-6">
        This page tests the thumbnail component with various scenarios.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Test with direct path in frontmatter */}
        <div className="space-y-2 border border-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Direct Path Test</h2>
          <p className="text-sm text-gray-600">Using path in frontmatter.images.hero.url</p>
          <div className="w-full h-48 border border-gray-300">
            <Thumbnail 
              alt="Direct Path Test"
              frontmatter={{
                images: {
                  hero: {
                    url: "/images/ceramic-laser-cleaning-hero.jpg"
                  }
                }
              }}
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
        
        {/* Test with default fallback */}
        <div className="space-y-2 border border-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Default Fallback Test</h2>
          <p className="text-sm text-gray-600">No images in frontmatter</p>
          <div className="w-full h-48 border border-gray-300">
            <Thumbnail 
              alt="Default Fallback Test"
              frontmatter={{ 
                category: "ceramic",
                articleType: "material"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
