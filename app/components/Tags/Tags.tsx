// app/components/Tags/Tags.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { capitalizeWords } from '../../utils/formatting';
import { useRouter } from "next/navigation";

interface TagsData {
  tags?: string[];
  metadata?: {
    material?: string;
    count?: number;
    categories?: string[];
    generated?: string;
  };
}

interface TagsProps {
  content: string | TagsData; // Can be raw YAML string or parsed YAML data
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
    showMetadata?: boolean; // Whether to display metadata information
    [key: string]: unknown;
  };
}

export function Tags({ content, config }: TagsProps) {
  const router = useRouter();
  
  if (!content) return null;
  
  const { 
    className = "my-6", 
    title = "Tags",
    pillColor = "bg-gray-800",
    textColor = "text-blue-800 dark:text-blue-200 dark:hover:text-blue-50",
    hoverColor = "dark:hover:bg-gray-900",
    linkPrefix = "/tag/",
    onClick,
    hideEmptyTags = false,
    articleMatchCount = {},
  } = config || {};
  
  // Parse tags from the content string
  // For the format shown in alumina-laser-cleaning.md
const parseTags = (content: string | TagsData): string[] => {
  // Handle YAML data structure
  if (typeof content === 'object' && content !== null) {
    return content.tags || [];
  }
  
  // Handle legacy string format
  if (typeof content !== 'string') {
    return [];
  }
  
  return content
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};  // Convert string to title case, replacing hyphens with spaces for display
  const toTitleCase = (str: string): string => {
    return capitalizeWords(str);
  };
  
  const allTags = parseTags(content);
  const metadata = typeof content === 'object' && content !== null ? content.metadata : undefined;
  
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
      
      {/* Metadata display */}
      {config?.showMetadata && metadata && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <div className="flex flex-wrap gap-4">
            {metadata.material && (
              <span className="font-medium">
                Material: <span className="font-normal">{capitalizeWords(metadata.material)}</span>
              </span>
            )}
            {metadata.count && (
              <span className="font-medium">
                Tags: <span className="font-normal">{metadata.count}</span>
              </span>
            )}
            {metadata.categories && metadata.categories.length > 0 && (
              <span className="font-medium">
                Categories: <span className="font-normal">{metadata.categories.map(cat => capitalizeWords(cat)).join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-4">
        {tags.map((tag, index) => (
          onClick ? (
            // Interactive button for in-page filtering
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className={`inline-block px-3 py-2 rounded-full text-sm font-medium ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
            >
              {toTitleCase(tag)}
            </button>
          ) : (
            // Link for navigation to tag page
            <Link
              key={index}
              href={`${linkPrefix}${encodeURIComponent(tag)}`}
              className={`inline-block px-3 py-2 rounded-full text-sm font-medium ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
            >
              {toTitleCase(tag)}
            </Link>
          )
        ))}
      </div>
    </div>
  );
}