// app/components/UI/TagFilter.tsx
"use client";

import Link from "next/link";
import type { TagFilterProps } from '@/types';

export function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
  linkPrefix,
  className = "",
  tagItemCounts,
}: TagFilterProps) {
  // If there are no tags, don't render anything
  if (!tags || tags.length === 0) {
    return (
      <div className={`${className} text-center text-gray-500 italic text-sm py-2`}>
        No tags available
      </div>
    );
  }
  
  return (
    <div className={className}>
      {tags.map((tag) => {
        // Case-insensitive comparison for the selected state
        const isSelected = selectedTag && 
          tag.toLowerCase() === selectedTag.toLowerCase();

        const tagClass = isSelected
          ? "bg-blue-500 text-white"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

        // For link-based navigation
        if (linkPrefix) {
          return (
            <Link
              key={tag}
              href={`${linkPrefix}${encodeURIComponent(tag)}`}
              className={`${tagClass} px-3 py-1 rounded-full text-sm transition-colors flex items-center`}
            >
              {tag}
            </Link>
          );
        }

        // For state-based filtering - only render button if onSelectTag is provided
        if (onSelectTag) {
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(isSelected ? "" : tag)}
              className={`${tagClass} px-3 py-1 rounded-full text-sm transition-colors flex items-center`}
            >
              {tag}
            </button>
          );
        }

        // Default if neither linkPrefix nor onSelectTag is provided
        return (
          <span
            key={tag}
            className={`${tagClass} px-3 py-1 rounded-full text-sm flex items-center`}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}