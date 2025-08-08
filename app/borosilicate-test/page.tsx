"use client";

import { Thumbnail } from '../components/Thumbnail/Thumbnail';

export default function MaterialThumbnailTest() {
  // Simulate the failed frontmatter structures for testing
  const failedBorosilicateFrontmatter = {
    subject: 'Borosilicate Glass',
    status: 'failed'
  };
  
  const failedZirconiaFrontmatter = {
    subject: 'Zirconia',
    category: 'ceramic',
    articleType: 'material',
    status: 'failed'
  };
  
  const failedUrethaneFrontmatter = {
    subject: 'Urethane Composites',
    category: 'composite',
    articleType: 'material',
    status: 'failed'
  };
  
  // Simulate a working frontmatter with images section
  const workingFrontmatter = {
    subject: 'Beryllium',
    images: {
      hero: {
        url: '/images/beryllium-laser-cleaning-hero.jpg'
      }
    }
  };

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Material Thumbnail Test</h1>
      
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">1. Borosilicate Glass</h2>
          <p>Testing with frontmatter that has status:failed and subject:Borosilicate Glass</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              alt="Borosilicate Glass Test" 
              frontmatter={failedBorosilicateFrontmatter}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">2. Zirconia</h2>
          <p>Testing with failed frontmatter for Zirconia</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              alt="Zirconia" 
              frontmatter={failedZirconiaFrontmatter}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">3. Urethane Composites</h2>
          <p>Testing with failed frontmatter for Urethane Composites</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              alt="Urethane Composites" 
              frontmatter={failedUrethaneFrontmatter}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">4. Direct path test</h2>
          <p>Testing with direct src path to borosilicate image</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              src="/images/borosilicate-glass-laser-cleaning-hero.jpg"
              alt="Borosilicate Glass Test" 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">5. Working frontmatter</h2>
          <p>Testing with working frontmatter that has images.hero.url</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              alt="Beryllium Test" 
              frontmatter={workingFrontmatter}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">6. Category fallback</h2>
          <p>Testing with just a category (ceramic) to trigger category fallback</p>
          <div className="w-64 h-48 border border-gray-300">
            <Thumbnail 
              alt="Unknown Ceramic" 
              frontmatter={{ category: 'ceramic' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
