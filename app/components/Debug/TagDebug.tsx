// app/components/Debug/TagDebug.tsx
"use client";

import { useState, useEffect } from "react";
import { Tags } from "../Tags/Tags";

export function TagDebug() {
  const [isLoading, setIsLoading] = useState(true);
  const [tagInfo, setTagInfo] = useState<{
    content: string | null;
    counts: Record<string, number>;
  }>({
    content: null,
    counts: {}
  });

  useEffect(() => {
    async function loadTagData() {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch this data from your API
        // For this example, we'll create mock data
        const mockTagContent = "Laser Cleaning, Ceramic, Surface Treatment, Oxide Removal, Precision Cleaning, Alumina, Semiconductor Manufacturing, Medical Devices, Aerospace Components, Nonexistent Tag";
        
        // Simulate some tags with matches and some without
        const mockCounts = {
          "Laser Cleaning": 15,
          "Ceramic": 8,
          "Surface Treatment": 12,
          "Oxide Removal": 5,
          "Precision Cleaning": 7,
          "Alumina": 3,
          "Semiconductor Manufacturing": 4,
          "Medical Devices": 0, // This tag has zero matching articles
          "Aerospace Components": 0, // This tag has zero matching articles
          "Nonexistent Tag": 0 // This tag has zero matching articles
        };
        
        // Log for debugging
        console.log('[TagDebug] Mock tag content:', mockTagContent);
        console.log('[TagDebug] Mock tag counts:', mockCounts);
        
        setTagInfo({
          content: mockTagContent,
          counts: mockCounts
        });
      } catch (error) {
        console.error("Error loading tag data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTagData();
  }, []);
  
  if (isLoading) {
    return <div className="my-4 text-gray-500">Loading tag data...</div>;
  }
  
  if (!tagInfo.content) {
    return <div className="my-4 text-gray-500">No tag data available</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Tag Filter Debug</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">All Tags (Including Empty)</h3>
        <Tags
          content={tagInfo.content}
          config={{
            title: "All Tags",
            hideEmptyTags: false,
            articleMatchCount: tagInfo.counts
          }}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Filtered Tags (Hiding Empty)</h3>
        <Tags
          content={tagInfo.content}
          config={{
            title: "Filtered Tags",
            hideEmptyTags: true,
            articleMatchCount: tagInfo.counts
          }}
        />
      </div>
    </div>
  );
}
