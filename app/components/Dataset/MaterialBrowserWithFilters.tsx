// app/components/Dataset/MaterialBrowserWithFilters.tsx
'use client';

import React, { useState, useMemo } from 'react';
import MaterialFilters from './MaterialFilters';
import MaterialBrowser from './MaterialBrowser';
import { SectionContainer } from '../SectionContainer';
import type { MaterialBrowserProps } from '@/types/centralized';

export default function MaterialBrowserWithFilters({ materials }: MaterialBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(materials.map(m => m.category))).sort();
    return ['all', ...cats];
  }, [materials]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(material => {
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

  return (
    <>
      {/* Search & Filters Section */}
      <SectionContainer title="Search & Filter" bgColor="navbar" horizPadding={true} radius={true}>
        <MaterialFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          categories={categories}
          resultCount={filteredMaterials.length}
          totalCount={materials.length}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSortBy}
        />
      </SectionContainer>

      {/* Results Section */}
      <SectionContainer title="Materials" bgColor="transparent" radius={false}>
        <MaterialBrowser 
          materials={filteredMaterials} 
          showFilters={false}
        />
      </SectionContainer>
    </>
  );
}
