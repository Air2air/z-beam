// app/components/Tags/Tags.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { capitalizeWords } from '../../utils/formatting';
import { useRouter } from "next/navigation";
import { TagsData, TagsProps } from '@/types';

export function Tags({ frontmatter, content, config }: TagsProps) {
  const router = useRouter();
  
  // Prioritize frontmatter.tags if available
  if (!content && !frontmatter?.tags) return null;
  
  const { 
    className = "my-6", 
    title = "Tags",
    pillColor = "bg-gray-800",
    textColor = "text-blue-800 dark:text-blue-200",
    hoverColor = "",
    linkPrefix = "/search?q=",
    onClick,
    hideEmptyTags = false,
    articleMatchCount = {},
  } = config || {};
  
  // Parse tags from the content string
  // For the format shown in alumina-laser-cleaning.md
const parseTags = (content: string | TagsData): string[] => {
  // Handle YAML data structure
  if (typeof content === 'object' && content !== null) {
    // If tags array is provided, use it directly
    if (content.tags && Array.isArray(content.tags)) {
      return content.tags;
    }
    
    // If categories are provided, flatten all category arrays
    if (content.categories) {
      const allTags: string[] = [];
      Object.values(content.categories).forEach(categoryTags => {
        if (Array.isArray(categoryTags)) {
          allTags.push(...categoryTags);
        }
      });
      return allTags;
    }
    
    return [];
  }
  
  // Handle string content (could be YAML or comma-separated)
  if (typeof content !== 'string') {
    return [];
  }
  
  // Check if content looks like YAML (contains "tags:" or "categories:")
  if (content.includes('tags:') || content.includes('categories:')) {
    try {
      // Try to extract tags from YAML-like content
      const tagMatches = content.match(/tags:\s*\n((?:\s*-\s*.+\n?)*)/);
      if (tagMatches && tagMatches[1]) {
        // Extract list items from YAML array
        const yamlTags = tagMatches[1]
          .split('\n')
          .map(line => line.replace(/^\s*-\s*/, '').trim())
          .filter(tag => tag.length > 0);
        
        if (yamlTags.length > 0) {
          return yamlTags;
        }
      }
      
      // If no direct tags array, try to extract from categories
      const categoryMatches = content.match(/categories:\s*\n((?:\s+\w+:\s*\n(?:\s*-\s*.+\n?)*)*)/);
      if (categoryMatches && categoryMatches[1]) {
        const categorySection = categoryMatches[1];
        const allCategoryTags: string[] = [];
        
        // Extract tags from each category
        const categoryBlocks = categorySection.split(/\n\s+\w+:\s*\n/).filter(Boolean);
        categoryBlocks.forEach(block => {
          const tags = block
            .split('\n')
            .map(line => line.replace(/^\s*-\s*/, '').trim())
            .filter(tag => tag.length > 0);
          allCategoryTags.push(...tags);
        });
        
        if (allCategoryTags.length > 0) {
          return allCategoryTags;
        }
      }
    } catch (error) {
      // If YAML parsing fails, fall back to comma-separated parsing
      console.warn('Failed to parse YAML content, falling back to comma-separated format:', error);
    }
  }
  
  // Legacy comma-separated format or fallback
  return content
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};  // Convert string to title case, replacing hyphens with spaces for display
  const toTitleCase = (str: string): string => {
    return capitalizeWords(str);
  };
  
  // Parse YAML string content if needed
  const parseYamlString = (yamlContent: string): Partial<TagsData> => {
    const result: Partial<TagsData> = {};
    
    // Extract material
    const materialMatch = yamlContent.match(/^material:\s*"?([^"\n]+)"?/m);
    if (materialMatch) {
      result.material = materialMatch[1];
    }
    
    // Extract count
    const countMatch = yamlContent.match(/^count:\s*(\d+)/m);
    if (countMatch) {
      result.count = parseInt(countMatch[1], 10);
    }
    
    // Extract categories
    const categoriesMatch = yamlContent.match(/categories:\s*\n((?:\s+\w+:\s*\n(?:\s*-\s*.+\n?)*)*)/);
    if (categoriesMatch && categoriesMatch[1]) {
      result.categories = {};
      const categorySection = categoriesMatch[1];
      
      // Split by category headers (e.g., "  industry:" or "  process:")
      const categoryMatches = categorySection.match(/^\s+(\w+):\s*\n((?:\s*-\s*.+\n?)*)/gm);
      if (categoryMatches) {
        categoryMatches.forEach(categoryBlock => {
          const categoryHeaderMatch = categoryBlock.match(/^\s+(\w+):\s*\n((?:\s*-\s*.+\n?)*)/);
          if (categoryHeaderMatch) {
            const categoryName = categoryHeaderMatch[1];
            const categoryTags = categoryHeaderMatch[2]
              .split('\n')
              .map(line => line.replace(/^\s*-\s*/, '').trim())
              .filter(tag => tag.length > 0);
            
            if (result.categories) {
              result.categories[categoryName] = categoryTags;
            }
          }
        });
      }
    }
    
    // Extract metadata
    const metadataMatch = yamlContent.match(/metadata:\s*\n((?:\s+\w+:\s*.+\n?)*)/);
    if (metadataMatch && metadataMatch[1]) {
      result.metadata = {};
      const metadataSection = metadataMatch[1];
      
      const formatMatch = metadataSection.match(/^\s+format:\s*"?([^"\n]+)"?/m);
      if (formatMatch) {
        result.metadata.format = formatMatch[1];
      }
      
      const versionMatch = metadataSection.match(/^\s+version:\s*"?([^"\n]+)"?/m);
      if (versionMatch) {
        result.metadata.version = versionMatch[1];
      }
      
      const generatedMatch = metadataSection.match(/^\s+generated:\s*"?([^"\n]+)"?/m);
      if (generatedMatch) {
        result.metadata.generated = generatedMatch[1];
      }
    }
    
    return result;
  };

  // Extract data from content
  let parsedData: Partial<TagsData> = {};
  if (typeof content === 'string' && (content.includes('tags:') || content.includes('categories:'))) {
    parsedData = parseYamlString(content);
  } else if (typeof content === 'object' && content !== null) {
    parsedData = content;
  }

  // Prioritize frontmatter.tags over content-based tags
  const allTags = frontmatter?.tags || (content ? parseTags(content) : []);
  const metadata = parsedData.metadata;
  const count = parsedData.count;
  const categories = parsedData.categories;
  const material = parsedData.material || metadata?.material;
  
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
    <div className={`tags-container ${className}`} data-testid="tags-container">
      {/* Title display */}
      {title && config?.title && (
        <h3 className="text-lg mb-3">{config.title}</h3>
      )}
      
      {/* Metadata display */}
      {config?.showMetadata && (metadata || count || categories || material) && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
          <div className="flex flex-wrap gap-4">
            {material && (
              <span>
                <strong>Material:</strong> {capitalizeWords(material)}
              </span>
            )}
            {count && (
              <span>
                <strong>Tags:</strong> {count}
              </span>
            )}
            {categories && Object.keys(categories).length > 0 && (
              <span>
                <strong>Categories:</strong> {Object.entries(categories)
                    .filter(([key, value]) => value && value.length > 0) // Filter out empty categories
                    .map(([key, value]) => capitalizeWords(key))
                    .join(', ')
                  }
              </span>
            )}
            {metadata?.format && (
              <span>
                <strong>Format:</strong> {metadata.format} v{metadata.version || '1.0'}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Categorized tags display */}
      {config?.showCategorized && categories && Object.keys(categories).length > 0 ? (
        <div className="space-y-3">
          {Object.entries(categories)
            .filter(([categoryName, categoryTags]) => categoryTags && categoryTags.length > 0) // Only show non-empty categories
            .map(([categoryName, categoryTags]) => (
              <div key={categoryName}>
                <div className="flex flex-wrap gap-2">
                  {categoryTags!.map((tag, index) => (
                    onClick ? (
                      <button
                        type="button"
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className={`inline-block px-3 py-2 rounded-full text-sm ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
                        aria-label={`Filter by ${tag} tag`}
                        title={`Filter by ${tag} tag`}
                      >
                        {toTitleCase(tag)}
                      </button>
                    ) : (
                      <Link
                        key={index}
                        href={`${linkPrefix}${encodeURIComponent(tag)}`}
                        legacyBehavior
                      >
                        <a
                          className={`inline-block px-3 py-2 rounded-full text-sm ${pillColor} ${textColor} ${hoverColor} cursor-pointer flex items-center`}
                          aria-label={`View all articles tagged with ${tag}`}
                          title={`View all articles tagged with ${tag}`}
                        >
                          {toTitleCase(tag)}
                        </a>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        // Standard flat tags display
        <div className="flex flex-wrap gap-4">
          {tags.map((tag, index) => (
            onClick ? (
              // Interactive button for in-page filtering
              <button
                type="button"
                key={index}
                onClick={() => handleTagClick(tag)}
                className={`inline-block px-3 py-2 rounded-full text-sm ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
                aria-label={`Filter by ${tag} tag`}
                title={`Filter by ${tag} tag`}
              >
                {toTitleCase(tag)}
              </button>
            ) : (
              // Link for navigation to tag page - use legacy Link approach for testing
              <Link
                key={index}
                href={`${linkPrefix}${encodeURIComponent(tag)}`}
                legacyBehavior
              >
                <a
                  className={`inline-block px-3 py-2 rounded-full text-sm ${pillColor} ${textColor} ${hoverColor} cursor-pointer transition-colors duration-200 flex items-center`}
                  aria-label={`View all articles tagged with ${tag}`}
                  title={`View all articles tagged with ${tag}`}
                >
                  {toTitleCase(tag)}
                </a>
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}