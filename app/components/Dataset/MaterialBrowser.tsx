// app/components/Dataset/MaterialBrowser.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { SearchIcon, DownloadIcon, FilterIcon, XIcon } from '@/app/components/Buttons';
import { DatasetCard } from './DatasetCard';
import { getGridClasses } from '@/app/config/site';
import { capitalizeWords } from '@/app/utils/formatting';
import type { MaterialBrowserProps, DatasetMaterial } from '@/types/centralized';

interface MaterialBrowserExtendedProps extends MaterialBrowserProps {
  showFilters?: boolean;
  searchTerm?: string;
  selectedCategory?: string;
  sortBy?: 'name' | 'category';
  onSearchChange?: (term: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: 'name' | 'category') => void;
}

export default function MaterialBrowser({ 
  materials, 
  showFilters = true,
  searchTerm: externalSearchTerm,
  selectedCategory: externalCategory,
  sortBy: externalSortBy,
  onSearchChange,
  onCategoryChange,
  onSortChange
}: MaterialBrowserExtendedProps) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(externalCategory || 'all');
  const [sortBy, setSortBy] = useState<'name' | 'category'>(externalSortBy || 'name');

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    onSearchChange?.(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  const handleSortChange = (sort: 'name' | 'category') => {
    setSortBy(sort);
    onSortChange?.(sort);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(materials.map(m => m.category))).sort();
    return ['all', ...cats];
  }, [materials]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    const filtered = materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [materials, searchTerm, selectedCategory, sortBy]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCategoryName = (category: string) => {
    return capitalizeWords(category.replace(/-/g, ' '));
  };

  // Expose search/filter UI separately
  const filtersUI = (
    <div className="material-browser-filters space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Filter & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FilterIcon className="inline w-4 h-4 mr-1" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : formatCategoryName(cat)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'name' | 'category')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name (A-Z)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredMaterials.length} of {materials.length} materials
      </div>
    </div>
  );

  return (
    <div id="materials" className="space-y-6">
      {/* Filters - only show if enabled */}
      {showFilters && filtersUI}

      {/* Materials Grid - Using centralized grid configuration */}
      <div className={getGridClasses({ columns: 3, gap: "md" })}>
        {filteredMaterials.map((material) => {
          return (
            <DatasetCard
              key={material.slug}
              frontmatter={{
                title: material.name,
                subject: material.name,
                slug: material.slug,
                description: `${formatCategoryName(material.category)} - ${formatCategoryName(material.subcategory)}`,
                category: material.category,
                subcategory: material.subcategory,
                images: {
                  hero: {
                    url: `/images/material/${material.slug}-hero.jpg`,
                    alt: material.name
                  }
                }
              }}
              href={`/materials/${material.category}/${material.subcategory}/${material.slug}`}
              formats={[
                { format: 'JSON', url: material.downloads.json },
                { format: 'CSV', url: material.downloads.csv },
                { format: 'TXT', url: material.downloads.txt },
              ]}
              category={formatCategoryName(material.category)}
              subcategory={formatCategoryName(material.subcategory)}
              onQuickDownload={(format: string, url: string) => {
                handleDownload(url, `${material.slug}.${format.toLowerCase()}`);
              }}
            />
          );
        })}
      </div>

      {/* No results */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <SearchIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No materials found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
