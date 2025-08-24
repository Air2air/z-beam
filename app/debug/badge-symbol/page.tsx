'use client';

import React, { useEffect, useState } from 'react';
import { BadgeSymbol } from '@/app/components/BadgeSymbol/BadgeSymbol';
import { DebugLayout } from '@/app/components/Debug/DebugLayout';

export default function BadgeSymbolDebugPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch material data
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/debug?category=materials');
        if (!response.ok) {
          throw new Error('Failed to load materials');
        }
        const data = await response.json();
        setMaterials(data.materials || []);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Mock frontmatter for testing specific cases
  const testFrontmatter = [
    {
      name: 'Aluminum',
      chemicalProperties: {
        symbol: 'Al',
        formula: 'Al',
        materialType: 'element',
        atomicNumber: 13
      }
    },
    {
      name: 'Gold',
      chemicalProperties: {
        symbol: 'Au',
        formula: 'Au',
        materialType: 'element',
        atomicNumber: 79
      }
    },
    {
      name: 'Beryllium',
      chemicalProperties: {
        symbol: 'Be',
        formula: 'Be',
        materialType: 'element',
        atomicNumber: 4
      }
    },
    {
      name: 'Silicon Nitride',
      chemicalProperties: {
        symbol: 'Si3N4',
        formula: 'Si3N4',
        materialType: 'ceramic'
      }
    },
    {
      name: 'Carbon Fiber',
      chemicalProperties: {
        symbol: 'C',
        formula: 'C',
        materialType: 'composite',
        atomicNumber: 6
      }
    }
  ];

  return (
    <DebugLayout>
      <h1 className="text-2xl font-bold mb-6">Badge Symbol Debug</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testFrontmatter.map((fm, index) => (
            <div key={index} className="relative bg-gray-100 p-4 rounded-lg h-48">
              <h3 className="text-lg font-medium mb-2">{fm.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Symbol: {fm.chemicalProperties.symbol}<br />
                Formula: {fm.chemicalProperties.formula}<br />
                Type: {fm.chemicalProperties.materialType}
              </p>
              <div className="w-full h-full">
                <BadgeSymbol 
                  content=""
                  config={{
                    symbol: fm.chemicalProperties.symbol,
                    formula: fm.chemicalProperties.formula,
                    materialType: fm.chemicalProperties.materialType as any,
                    atomicNumber: fm.chemicalProperties.atomicNumber,
                    variant: "card"
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Materials from API</h2>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <div key={index} className="relative bg-gray-100 p-4 rounded-lg h-48">
                <h3 className="text-lg font-medium mb-2">{material.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Type: {material.type}<br />
                  Status: {material.status}
                </p>
                <div className="w-full h-full">
                  <BadgeSymbol 
                    content=""
                    config={{
                      symbol: material.name.slice(0, 2), // First 2 chars as symbol
                      materialType: material.type,
                      variant: "card"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DebugLayout>
  );
}
