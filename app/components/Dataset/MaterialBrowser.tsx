// app/components/Dataset/MaterialBrowser.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { SearchIcon, FilterIcon, XIcon } from '@/app/components/Buttons';
import { DatasetCard } from './DatasetCard';
import { SectionContainer } from '../SectionContainer';
import MaterialFilters from './MaterialFilters';
import { getGridClasses, GRID_GAP_RESPONSIVE } from '@/app/config/site';
import { capitalizeWords } from '@/app/utils/formatting';
import { triggerDownload } from '@/app/utils/downloadUtils';
import type { MaterialBrowserProps } from '@/types/centralized';

interface MaterialBrowserExtendedProps extends MaterialBrowserProps {
  showFilters?: boolean;
  searchTerm?: string;
  selectedCategory?: string;
  sortBy?: 'name' | 'category';
  onSearchChange?: (term: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: 'name' | 'category') => void;
  withFilterSection?: boolean; // New prop to enable full filter section UI
}

export default function MaterialBrowser({ 
  materials, 
  showFilters = true,
  withFilterSection = false,
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

  const formatCategoryName = (category: string) => {
    return capitalizeWords(category.replace(/-/g, ' '));
  };

  // If withFilterSection is true, render with SectionContainer wrappers
  if (withFilterSection) {
    return (
      <>
        {/* Search & Filters Section */}
        <SectionContainer title="Or, search & filter" bgColor="default" horizPadding={true} radius={true}>
          <MaterialFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            categories={categories}
            resultCount={filteredMaterials.length}
            totalCount={materials.length}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
          />
        </SectionContainer>

        {/* Results Section */}
        <SectionContainer title="Materials" bgColor="transparent" radius={false}>
          <div className={`${getGridClasses({ columns: 3 })} ${GRID_GAP_RESPONSIVE}`}>
            {filteredMaterials.map((material: any) => (
              <DatasetCard
                key={material.slug}
                frontmatter={{ 
                  title: material.name,
                  name: material.name,
                  slug: material.slug 
                } as any}
                href={`/datasets/materials/${material.slug}-material-dataset`}
                category={formatCategoryName(material.category)}
                subcategory={formatCategoryName(material.subcategory)}
                formats={[{ format: 'JSON', url: `/datasets/materials/${material.slug}-material-dataset.json` }]}
                onQuickDownload={(format: string, url: string) => {
                  triggerDownload(url, `${material.slug}-material-dataset.${format.toLowerCase()}`);
                }}
              />
            ))}
            {filteredMaterials.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <div className="text-tertiary mb-4">
                  <SearchIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg text-secondary font-medium mb-2">
                  No materials found
                </h3>
                <p className="text-muted">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </SectionContainer>
      </>
    );
  }

  // Expose search/filter UI separately
  const filtersUI = (
    <div className="material-browser-filters space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border rounded-md bg-tertiary text-muted placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary hover:text-muted:text-secondary"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Filter & Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">
            <FilterIcon className="inline w-4 h-4 mr-1" />
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-tertiary text-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : formatCategoryName(cat)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as 'name' | 'category')}
            className="w-full px-4 py-2 border rounded-md bg-tertiary text-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name (A-Z)</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted">
        Showing {filteredMaterials.length} of {materials.length} materials
      </div>
    </div>
  );

  return (
    <div id="materials" className="space-y-6">
      {/* Filters - only show if enabled */}
      {showFilters && filtersUI}

      {/* Materials Grid - Using centralized grid configuration */}
      <div className={`${getGridClasses({ columns: 3 })} ${GRID_GAP_RESPONSIVE}`}>
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
                triggerDownload(url, `${material.slug}.${format.toLowerCase()}`);
              }}
            />
          );
        })}
      </div>

      {/* No results */}
      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <div className="text-tertiary mb-4">
            <SearchIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg text-secondary font-medium mb-2">
            No materials found
          </h3>
          <p className="text-muted">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
