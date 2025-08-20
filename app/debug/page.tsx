// app/debug/page.tsx
// Consolidated debug page for all testing functionality
'use client';

import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

interface DebugData {
  thumbnails: any[];
  images: any[];
  materials: any[];
  cards: any[];
  frontmatter: any[];
}

export default function DebugPage() {
  const [activeTab, setActiveTab] = useState('thumbnails');
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'thumbnails', label: 'Thumbnail Test', icon: '🖼️' },
    { id: 'images', label: 'Image Test', icon: '📷' },
    { id: 'materials', label: 'Material Fallback', icon: '🧪' },
    { id: 'cards', label: 'Card Debug', icon: '🃏' },
    { id: 'frontmatter', label: 'Frontmatter Debug', icon: '📄' },
    { id: 'borosilicate', label: 'Borosilicate Test', icon: '🔬' },
    { id: 'category', label: 'Category Fallback', icon: '📂' },
  ];

  const loadDebugData = async (type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock debug data loading - replace with actual API calls
      const mockData = {
        thumbnails: [
          { slug: 'test-1', url: '/images/test-1.jpg', alt: 'Test image 1' },
          { slug: 'test-2', url: '/images/test-2.jpg', alt: 'Test image 2' },
        ],
        images: [
          { id: 1, src: '/images/sample-1.jpg', width: 800, height: 600 },
          { id: 2, src: '/images/sample-2.jpg', width: 1200, height: 800 },
        ],
        materials: [
          { name: 'Steel', fallback: 'metal-generic', status: 'active' },
          { name: 'Aluminum', fallback: 'light-metal', status: 'active' },
        ],
        cards: [
          { title: 'Card 1', type: 'material', status: 'rendered' },
          { title: 'Card 2', type: 'service', status: 'rendered' },
        ],
        frontmatter: [
          { slug: 'home', title: 'Home Page', author: 'System' },
          { slug: 'about', title: 'About Page', author: 'Content Team' },
        ],
      };
      
      setDebugData(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Debug data loading error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugData(activeTab);
  }, [activeTab]);

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading debug data...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => loadDebugData(activeTab)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'thumbnails':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thumbnail Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {debugData?.thumbnails.map((thumb, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <img src={thumb.url} alt={thumb.alt} className="w-full h-32 object-cover rounded" />
                  <p className="mt-2 text-sm font-medium">{thumb.slug}</p>
                  <p className="text-xs text-gray-600">{thumb.alt}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Image Testing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debugData?.images.map((img, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <img src={img.src} alt="Test" className="w-full h-48 object-cover rounded" />
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Dimensions:</span> {img.width} x {img.height}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'materials':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Material Fallback Testing</h3>
            <div className="space-y-2">
              {debugData?.materials.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{material.name}</span>
                  <span className="text-sm text-gray-600">Fallback: {material.fallback}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    material.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {material.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cards':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Card Debugging</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debugData?.cards.map((card, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{card.title}</h4>
                  <p className="text-sm text-gray-600">Type: {card.type}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    card.status === 'rendered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {card.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'frontmatter':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Frontmatter Debugging</h3>
            <div className="space-y-3">
              {debugData?.frontmatter.map((fm, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{fm.title}</h4>
                      <p className="text-sm text-gray-600">Slug: {fm.slug}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {fm.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'borosilicate':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Borosilicate Testing</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800">Material Properties</h4>
              <div className="mt-2 space-y-1 text-sm text-blue-700">
                <p><span className="font-medium">Chemical Formula:</span> B₂O₃·SiO₂</p>
                <p><span className="font-medium">Melting Point:</span> 1,648°C (3,000°F)</p>
                <p><span className="font-medium">Thermal Expansion:</span> 3.3 × 10⁻⁶/°C</p>
                <p><span className="font-medium">Laser Compatibility:</span> Excellent</p>
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Category Fallback Testing</h3>
            <div className="space-y-2">
              {['materials', 'services', 'applications', 'regions'].map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium capitalize">{category}</span>
                  <span className="text-sm text-gray-600">Fallback: generic-{category}</span>
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Select a tab to view debug information</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Debug Console</h1>
          <p className="mt-2 text-gray-600">
            Consolidated testing and debugging interface for all Z-Beam components
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => loadDebugData(activeTab)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              🏠 Back to Home
            </button>
            <button 
              onClick={() => window.open('/api/debug', '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              🔍 API Debug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
