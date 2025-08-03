// app/components/Tags/Tags.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface TagsProps {
  content: string; // The raw content from the tags markdown file
  config?: {
    className?: string;
    title?: string;
    pillColor?: string;
    textColor?: string;
    hoverColor?: string;
    linkPrefix?: string; // Path prefix for tag links e.g., "/tag/"
    onClick?: (tag: string) => void; // Alternative to links - for in-page filtering
    hideEmptyTags?: boolean; // Whether to hide tags with no matching articles
    articleMatchCount?: Record<string, number>; // Counts of articles matching each tag
    [key: string]: any;
  };
}

export function Tags({ content, config }: TagsProps) {
  if (!content) return null;
  
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
    className = "my-6", 
    title = "Tags",
    pillColor = "bg-blue-100 dark:bg-blue-900",
    textColor = "text-blue-800 dark:text-blue-200",
    hoverColor = "hover:bg-blue-200 dark:hover:bg-blue-800",
    linkPrefix = "/tag/",
    onClick,
    hideEmptyTags = false,
    articleMatchCount = {},
  } = config || {};
  
  // Parse tags from the content string
  // For the format shown in alumina-laser-cleaning.md
  const parseTags = (content: string): string[] => {
    // Skip any comment lines
    const contentWithoutComments = content.replace(/<!--.*?-->/gs, '').trim();
    
    // Split by commas and trim each tag
    return contentWithoutComments
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };
  
  const allTags = parseTags(content);
  
  // Debug: Log article match counts
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Tags component - All tags:', allTags);
      console.log('Tags component - Article match counts:', articleMatchCount);
      console.log('Tags component - Has match counts:', Object.keys(articleMatchCount).length > 0);
      
      // Check if any tags have matches
      const tagsWithMatches = Object.entries(articleMatchCount)
        .filter(([_, count]) => count > 0)
        .map(([tag]) => tag);
      
      console.log('Tags component - Tags with matches:', tagsWithMatches);
      
      // Log tags with zero matches
      const tagsWithZeroMatches = Object.entries(articleMatchCount)
        .filter(([_, count]) => count === 0)
        .map(([tag]) => tag);
      
      console.log('Tags component - Tags with zero matches:', tagsWithZeroMatches);
      console.log('Tags component - hideEmptyTags setting:', hideEmptyTags);
    }
  }, [allTags, articleMatchCount, hideEmptyTags]);
  
  // Filter out tags with zero matching articles if hideEmptyTags is true
  const tags = hideEmptyTags 
    ? allTags.filter(tag => {
        // If articleMatchCount is provided, use it to determine if the tag has any matches
        if (Object.keys(articleMatchCount).length > 0) {
          return articleMatchCount[tag] > 0;
        }
        // If no articleMatchCount is provided, show all tags
        return true;
      })
    : allTags;
  
  const handleTagClick = (tag: string) => {
    if (onClick) {
      // Use the provided click handler for in-page filtering
      onClick(tag);
    } else {
      // Default behavior: navigate to tag page
      router.push(`${linkPrefix}${encodeURIComponent(tag)}`);
    }
  };
  
  return (
    <div className={`tags-container ${className}`}>
      {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          onClick ? (
            // Interactive button for in-page filtering
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
            >
              {tag}
              {process.env.NODE_ENV === 'development' && Object.keys(articleMatchCount).length > 0 && (
                <span className="ml-1 text-xs opacity-70">({articleMatchCount[tag] || 0})</span>
              )}
            </button>
          ) : (
            // Link for navigation to tag page
            <Link
              key={index}
              href={`${linkPrefix}${encodeURIComponent(tag)}`}
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
            >
              {tag}
              {process.env.NODE_ENV === 'development' && Object.keys(articleMatchCount).length > 0 && (
                <span className="ml-1 text-xs opacity-70">({articleMatchCount[tag] || 0})</span>
              )}
            </Link>
          )
        ))}
      </div>

      {/* Development-only debug information showing hidden tags */}
      {process.env.NODE_ENV === 'development' && hideEmptyTags && allTags.length !== tags.length && (
        <div className="mt-4 text-sm bg-gray-100 p-3 rounded-md">
          <h4 className="font-semibold text-gray-600">Hidden Tags (No Matching Articles):</h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {allTags
              .filter(tag => !tags.includes(tag))
              .map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 rounded-full text-xs text-gray-500 bg-gray-200"
                >
                  {tag} (0)
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}