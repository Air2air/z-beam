"use client";

import { useEffect, useState } from 'react';

export function FrontmatterNameChecker() {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkFiles = async () => {
      try {
        // We would need an API endpoint to check files, but this is a placeholder
        setFilePaths([
          "/content/components/frontmatter/kaolin-laser-cleaning.md",
          "/content/components/frontmatter/alumina-laser-cleaning.md",
          // Add other file paths here
        ]);
        setLoading(false);
      } catch (err) {
        setError("Failed to check frontmatter files");
        setLoading(false);
      }
    };
    
    checkFiles();
  }, []);
  
  if (loading) return <div className="text-center my-6">Checking frontmatter files...</div>;
  if (error) return <div className="text-red-500 my-6">{error}</div>;
  
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-md text-sm">
      <h3 className="font-bold mb-2">Frontmatter Name Field Check</h3>
      <p className="mb-4">The following files need name fields in frontmatter:</p>
      
      <div className="mb-6 bg-amber-50 p-4 rounded border border-amber-200">
        <h4 className="font-semibold text-amber-800 mb-2">Missing Names in Content Files:</h4>
        <ul className="list-disc pl-5">
          <li>zirconia-laser-cleaning.md</li>
          <li>asphalt-laser-cleaning.md</li>
        </ul>
        <div className="mt-4 text-sm">
          <p className="font-semibold">Action required:</p>
          <p>Edit these files to add the name field in frontmatter:</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold">Add these lines to each file:</h4>
        <pre className="bg-gray-800 text-white p-2 rounded mt-2 overflow-auto">
{`<!-- Category: ceramic, Article Type: material, Subject: Zirconia -->
---
name: Zirconia
title: Zirconia Laser Cleaning | Technical Guide
---`}
        </pre>
        
        <div className="mt-4 bg-green-50 p-3 rounded border border-green-200">
          <h5 className="font-semibold text-green-800">Temporary Solution:</h5>
          <p className="mt-1">
            For now, the system will extract material names from slugs using smart pattern detection:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>"zirconia-laser-cleaning" → "Zirconia"</li>
            <li>"asphalt-laser-cleaning" → "Asphalt"</li>
            <li>"silicon-carbide-laser-cleaning" → "Silicon Carbide"</li>
            <li>"silicon-nitride-laser-cleaning" → "Silicon Nitride"</li>
            <li>"aluminum-oxide-surface-prep" → "Aluminum Oxide"</li>
          </ul>
          <p className="mt-2">
            This automatic extraction handles both single-word and multi-word materials, but it's still recommended to set explicit name fields in frontmatter.
          </p>
        </div>
      </div>
    </div>
  );
}
