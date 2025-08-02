// app/components/UI/TagFilter.tsx
"use client";

import Link from "next/link";

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  onSelectTag?: (tag: string) => void; // Optional now
  linkPrefix?: string; // Add this
  className?: string;
}

export function TagFilter({
  tags,
  selectedTag,
  onSelectTag,
  linkPrefix = "/tag/",
  className = "",
}: TagFilterProps) {
  // Determine if we're using links or click handlers
  const useLinks = !onSelectTag;
  
  const renderButton = (tag: string, isSelected: boolean, label: string) => {
    const buttonClass = `px-3 py-1 rounded-full text-sm ${
      isSelected
        ? "bg-blue-500 text-white"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    } transition-colors`;
    
    return useLinks ? (
      <Link
        href={tag ? `${linkPrefix}${encodeURIComponent(tag)}` : "/"}
        className={buttonClass}
      >
        {label}
      </Link>
    ) : (
      <button
        onClick={() => onSelectTag?.(tag)}
        className={buttonClass}
      >
        {label}
      </button>
    );
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {renderButton("", selectedTag === "", "All")}
      
      {tags.map((tag) => renderButton(tag, selectedTag === tag, tag))}
    </div>
  );
}