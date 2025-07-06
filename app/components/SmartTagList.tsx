// app/components/SmartTagList.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { getTagInfo, sortTagsByPriority, filterTagsByCategory, groupTagsByCategory } from '../utils/tagConfig';
import type { TagConfig } from '../utils/tagConfig';

interface SmartTagListProps {
  tags: string[];
  title?: string;
  className?: string;
  maxTags?: number;
  linkable?: boolean; // Default: true - tags are clickable to view related articles
  sortByPriority?: boolean;
  showByCategory?: boolean;
  includeCategories?: TagConfig['category'][];
  excludeCategories?: TagConfig['category'][];
}

export function SmartTagList({ 
  tags, 
  title = "Tags",
  className = "mb-4",
  maxTags,
  linkable = true, // Changed default to true
  sortByPriority = true,
  showByCategory = false,
  includeCategories,
  excludeCategories = []
}: SmartTagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  // Clean and filter tags
  let processedTags = tags.filter(tag => tag && tag.trim() !== '');
  processedTags = Array.from(new Set(processedTags)); // Remove duplicates
  
  // Filter by categories if specified
  if (includeCategories && includeCategories.length > 0) {
    processedTags = filterTagsByCategory(processedTags, includeCategories);
  }
  
  if (excludeCategories.length > 0) {
    processedTags = processedTags.filter(tag => {
      const config = getTagInfo(tag);
      return !excludeCategories.includes(config.category);
    });
  }
  
  // Sort tags
  if (sortByPriority) {
    processedTags = sortTagsByPriority(processedTags);
  } else {
    processedTags.sort();
  }
  
  // Limit tags if specified
  const displayTags = maxTags ? processedTags.slice(0, maxTags) : processedTags;
  const hasMoreTags = maxTags && processedTags.length > maxTags;

  if (displayTags.length === 0) {
    return null;
  }

  // Client-side tag slug generation (matches server-side)
  const getTagSlug = (tag: string): string => {
    return tag
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const renderTag = (tag: string, index: number) => {
    const config = getTagInfo(tag);
    const displayName = config.displayName || tag;
    
    const tagClasses = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color?.bg || 'bg-blue-100'} ${config.color?.text || 'text-blue-800'} dark:bg-opacity-20`;
    
    const tagContent = (
      <span className={tagClasses}>
        {displayName}
      </span>
    );

    if (linkable) {
      return (
        <Link 
          key={index}
          href={`/tags/${getTagSlug(tag)}`}
          className="hover:opacity-80 hover:scale-105 transition-all duration-200 cursor-pointer"
          title={`View all articles tagged with "${displayName}"`}
        >
          {tagContent}
        </Link>
      );
    }

    return <span key={index}>{tagContent}</span>;
  };

  const renderGroupedTags = () => {
    const grouped = groupTagsByCategory(displayTags);
    
    return (
      <div className="space-y-3">
        {Object.entries(grouped).map(([category, categoryTags]) => {
          if (categoryTags.length === 0) return null;
          
          return (
            <div key={category}>
              <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag, index) => renderTag(tag, index))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
      )}
      
      {showByCategory ? renderGroupedTags() : (
        <div className="flex flex-wrap gap-2">
          {displayTags.map(renderTag)}
          {hasMoreTags && (
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
              +{processedTags.length - maxTags!} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
