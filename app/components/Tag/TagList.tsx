// app/components/TagList.tsx
import React from 'react';
import Link from 'next/link';

interface TagListProps {
  tags: string[];
  title?: string;
  className?: string;
  tagClassName?: string;
  maxTags?: number; // Limit number of tags shown
  showAll?: boolean; // Toggle to show/hide all tags
  linkable?: boolean; // Make tags clickable links
  sortTags?: boolean; // Sort tags alphabetically
  filterDuplicates?: boolean; // Remove duplicate tags
  excludeTags?: string[]; // Tags to exclude from display
}

export function TagList({ 
  tags, 
  title = "Tags",
  className = "mb-4",
  tagClassName = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  maxTags,
  showAll = true,
  linkable = false,
  sortTags = true,
  filterDuplicates = true,
  excludeTags = []
}: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Process tags based on options
  let processedTags = [...tags];
  
  // Filter out excluded tags and empty values
  if (excludeTags.length > 0) {
    processedTags = processedTags.filter(tag => 
      tag && tag.trim() !== '' && !excludeTags.includes(tag)
    );
  } else {
    processedTags = processedTags.filter(tag => tag && tag.trim() !== '');
  }
  
  // Remove duplicates if requested
  if (filterDuplicates) {
    processedTags = Array.from(new Set(processedTags));
  }
  
  // Sort tags if requested
  if (sortTags) {
    processedTags.sort();
  }
  
  // Limit tags if maxTags is specified
  const displayTags = maxTags && !showAll 
    ? processedTags.slice(0, maxTags)
    : processedTags;
    
  const hasMoreTags = maxTags && processedTags.length > maxTags && !showAll;

  if (displayTags.length === 0) {
    return null;
  }

  // Generate tag slug for links
  const getTagSlug = (tag: string): string => {
    return tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const renderTag = (tag: string, index: number) => {
    const tagContent = (
      <span className={tagClassName}>
        {tag}
      </span>
    );

    if (linkable) {
      return (
        <Link 
          key={index}
          href={`/tags/${getTagSlug(tag)}`}
          className="hover:opacity-80 transition-opacity"
        >
          {tagContent}
        </Link>
      );
    }

    return <span key={index}>{tagContent}</span>;
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {displayTags.map(renderTag)}
        {hasMoreTags && (
          <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
            +{processedTags.length - maxTags!} more
          </span>
        )}
      </div>
    </div>
  );
}
