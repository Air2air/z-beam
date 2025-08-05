// app/image-diagnostic/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageDiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const imagePath = '/images/borosilicate-glass-laser-cleaning-hero.jpg';
  const symbolicPath = '/images/borosilicate-laser-cleaning-hero.jpg';
  
  // Load diagnostic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/debug-image?path=${imagePath}`);
        if (!response.ok) throw new Error('Failed to fetch diagnostic data');
        const data = await response.json();
        setDiagnosticData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle image load success
  const handleImageLoad = (e: any, label: string) => {
    console.log(`Image loaded successfully: ${label}`, e);
  };
  
  // Handle image load error
  const handleImageError = (e: any, label: string) => {
    console.error(`Image failed to load: ${label}`, e);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Image Diagnostic Tool</h1>
      
      {loading && <p>Loading diagnostic data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {diagnosticData && (
        <div className="mb-8 p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Diagnostic Results</h2>
          <pre className="whitespace-pre-wrap bg-white p-4 rounded border">
            {JSON.stringify(diagnosticData, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test 1: Direct HTML img tag */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test 1: HTML img tag</h2>
          <img 
            src={imagePath} 
            alt="Direct HTML img test"
            width={400}
            height={300}
            className="border border-gray-300 w-full h-64 object-cover"
            onLoad={(e) => handleImageLoad(e, 'HTML img')}
            onError={(e) => handleImageError(e, 'HTML img')}
          />
          <p className="mt-2 text-sm text-gray-600">Path: {imagePath}</p>
        </div>
        
        {/* Test 2: Next.js Image component */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test 2: Next.js Image</h2>
          <div className="relative w-full h-64 border border-gray-300">
            <Image 
              src={imagePath}
              alt="Next.js Image test"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              onLoad={(e) => handleImageLoad(e, 'Next.js Image')}
              onError={(e) => handleImageError(e, 'Next.js Image')}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">Path: {imagePath}</p>
        </div>
        
        {/* Test 3: Symbolic link path */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test 3: Symbolic Link Path</h2>
          <div className="relative w-full h-64 border border-gray-300">
            <Image 
              src={symbolicPath}
              alt="Symbolic link test"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              onLoad={(e) => handleImageLoad(e, 'Symbolic Link')}
              onError={(e) => handleImageError(e, 'Symbolic Link')}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">Path: {symbolicPath}</p>
        </div>
        
        {/* Test 4: Direct URL with random query param */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test 4: URL with Cache Buster</h2>
          <div className="relative w-full h-64 border border-gray-300">
            <Image 
              src={`${imagePath}?v=${Math.random()}`}
              alt="Cache buster test"
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              onLoad={(e) => handleImageLoad(e, 'Cache Buster')}
              onError={(e) => handleImageError(e, 'Cache Buster')}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">Path: {imagePath}?v=random</p>
        </div>
      </div>
    </div>
  );
}
